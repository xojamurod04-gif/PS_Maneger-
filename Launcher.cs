using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace PSManager
{
    static class Program
    {
        private static TcpListener listener;
        private static string rootDir;
        private static int port = 8899;

        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                rootDir = Path.Combine(baseDir, "dist");
                if (!Directory.Exists(rootDir))
                {
                    rootDir = baseDir;
                }

                // Bind to local loopback 127.0.0.1 (bypasses Windows HTTP.sys elevation/ACL rules)
                IPAddress localAddr = IPAddress.Loopback;
                try
                {
                    listener = new TcpListener(localAddr, port);
                    listener.Start();
                }
                catch
                {
                    port = 8910;
                    listener = new TcpListener(localAddr, port);
                    listener.Start();
                }

                Thread serverThread = new Thread(ListenLoop);
                serverThread.IsBackground = true;
                serverThread.Start();

                Thread.Sleep(200);

                string appUrl = "http://127.0.0.1:" + port + "/";

                ProcessStartInfo startInfo = new ProcessStartInfo();
                startInfo.FileName = "msedge.exe";
                startInfo.Arguments = "--app=\"" + appUrl + "\" --window-size=1440,900 --user-data-dir=\"" + Path.Combine(Path.GetTempPath(), "PSManagerAppProfile") + "\"";
                startInfo.UseShellExecute = true;

                try
                {
                    Process.Start(startInfo);
                }
                catch
                {
                    startInfo.FileName = "chrome.exe";
                    try
                    {
                        Process.Start(startInfo);
                    }
                    catch
                    {
                        Process.Start(appUrl);
                    }
                }

                // Keep process alive so the local socket server continues serving assets
                Application.Run();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Xatolik: " + ex.Message, "PS MANAGER", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static void ListenLoop()
        {
            while (true)
            {
                try
                {
                    TcpClient client = listener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem((o) => HandleClient(client));
                }
                catch { break; }
            }
        }

        private static void HandleClient(TcpClient client)
        {
            using (client)
            {
                try
                {
                    NetworkStream stream = client.GetStream();
                    stream.ReadTimeout = 5000;
                    stream.WriteTimeout = 5000;

                    byte[] buffer = new byte[8192];
                    int bytesRead = stream.Read(buffer, 0, buffer.Length);
                    if (bytesRead <= 0) return;

                    string requestStr = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                    string[] lines = requestStr.Split(new[] { "\r\n", "\n" }, StringSplitOptions.None);
                    if (lines.Length == 0) return;

                    string[] tokens = lines[0].Split(' ');
                    if (tokens.Length < 2) return;

                    string rawPath = tokens[1];
                    int queryIdx = rawPath.IndexOf('?');
                    if (queryIdx >= 0) rawPath = rawPath.Substring(0, queryIdx);

                    string reqPath = rawPath.TrimStart('/');
                    if (string.IsNullOrEmpty(reqPath)) reqPath = "index.html";

                    string filePath = Path.Combine(rootDir, Uri.UnescapeDataString(reqPath.Replace('/', '\\')));

                    if (!File.Exists(filePath) || Directory.Exists(filePath))
                    {
                        filePath = Path.Combine(rootDir, "index.html");
                    }

                    if (!File.Exists(filePath))
                    {
                        byte[] notFound = Encoding.UTF8.GetBytes("HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found");
                        stream.Write(notFound, 0, notFound.Length);
                        return;
                    }

                    byte[] fileBytes = File.ReadAllBytes(filePath);

                    string ext = Path.GetExtension(filePath).ToLower();
                    string mime = "text/html; charset=utf-8";
                    if (ext == ".js") mime = "application/javascript; charset=utf-8";
                    else if (ext == ".css") mime = "text/css; charset=utf-8";
                    else if (ext == ".png") mime = "image/png";
                    else if (ext == ".jpg" || ext == ".jpeg") mime = "image/jpeg";
                    else if (ext == ".svg") mime = "image/svg+xml";
                    else if (ext == ".json") mime = "application/json; charset=utf-8";
                    else if (ext == ".ico") mime = "image/x-icon";
                    else if (ext == ".woff" || ext == ".woff2") mime = "font/woff2";

                    string header = "HTTP/1.1 200 OK\r\n" +
                                    "Content-Type: " + mime + "\r\n" +
                                    "Content-Length: " + fileBytes.Length + "\r\n" +
                                    "Access-Control-Allow-Origin: *\r\n" +
                                    "Connection: close\r\n\r\n";

                    byte[] headerBytes = Encoding.UTF8.GetBytes(header);
                    stream.Write(headerBytes, 0, headerBytes.Length);
                    stream.Write(fileBytes, 0, fileBytes.Length);
                    stream.Flush();
                }
                catch { }
            }
        }
    }
}
