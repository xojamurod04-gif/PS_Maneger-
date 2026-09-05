using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace PSManager
{
    static class Program
    {
        private static HttpListener listener;
        private static string rootDir;

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

                // Start local offline web server
                int port = 8899;
                listener = new HttpListener();
                listener.Prefixes.Add("http://localhost:" + port + "/");
                listener.Start();

                Thread serverThread = new Thread(StartServer);
                serverThread.IsBackground = true;
                serverThread.Start();

                // Launch Edge / Chrome in App Mode
                string appUrl = "http://localhost:" + port + "/";
                ProcessStartInfo startInfo = new ProcessStartInfo();
                startInfo.FileName = "msedge.exe";
                startInfo.Arguments = "--app=\"" + appUrl + "\" --window-size=1440,900 --user-data-dir=\"" + Path.Combine(Path.GetTempPath(), "PSManagerDataDir") + "\"";
                startInfo.UseShellExecute = true;

                try
                {
                    Process.Start(startInfo);
                }
                catch
                {
                    startInfo.FileName = "chrome.exe";
                    Process.Start(startInfo);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Xatolik: " + ex.Message, "PS MANAGER", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static void StartServer()
        {
            while (listener.IsListening)
            {
                try
                {
                    HttpListenerContext context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((o) => ProcessRequest(context));
                }
                catch { }
            }
        }

        private static void ProcessRequest(HttpListenerContext context)
        {
            try
            {
                string reqPath = context.Request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(reqPath)) reqPath = "index.html";

                string filePath = Path.Combine(rootDir, reqPath.Replace('/', '\\'));

                if (!File.Exists(filePath))
                {
                    filePath = Path.Combine(rootDir, "index.html");
                }

                byte[] bytes = File.ReadAllBytes(filePath);

                string ext = Path.GetExtension(filePath).ToLower();
                string mime = "text/html";
                if (ext == ".js") mime = "application/javascript";
                else if (ext == ".css") mime = "text/css";
                else if (ext == ".png") mime = "image/png";
                else if (ext == ".jpg" || ext == ".jpeg") mime = "image/jpeg";
                else if (ext == ".svg") mime = "image/svg+xml";

                context.Response.ContentType = mime;
                context.Response.ContentLength64 = bytes.Length;
                context.Response.OutputStream.Write(bytes, 0, bytes.Length);
                context.Response.OutputStream.Close();
            }
            catch
            {
                try { context.Response.StatusCode = 500; context.Response.Close(); } catch { }
            }
        }
    }
}
