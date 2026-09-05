using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace PSManager
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string htmlPath = Path.Combine(baseDir, "dist", "index.html");

                if (!File.Exists(htmlPath))
                {
                    htmlPath = Path.Combine(baseDir, "index.html");
                }

                string url = "file:///" + htmlPath.Replace('\\', '/');

                ProcessStartInfo startInfo = new ProcessStartInfo();
                startInfo.FileName = "msedge.exe";
                startInfo.Arguments = "--app=\"" + url + "\" --window-size=1440,900 --user-data-dir=\"" + Path.Combine(Path.GetTempPath(), "PSManagerAppData") + "\"";
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
    }
}
