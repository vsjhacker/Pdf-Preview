using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Microsoft.Web.WebView2.Core;

namespace PDFHostApp
{
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
            Send();
            LoadReactApp("http://localhost:5173");
        }

        private async void Send()
        {
            await GetAndSendPdfFromAssets();
        }

        private async void LoadReactApp(string uriString)
        {
            try
            {
                Uri reactAppUri = new Uri(uriString);
                await ReactWebView2.EnsureCoreWebView2Async();
                ReactWebView2.Source = reactAppUri;
                ReactWebView2.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;
            }
            catch (UriFormatException ex)
            {
                var dialog = new Windows.UI.Popups.MessageDialog("Invalid URI format: " + ex.Message);
                await dialog.ShowAsync();
            }
        }

        private void CoreWebView2_WebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            string message = e.TryGetWebMessageAsString();
            if (message == "printCompleted")
            {
                _ = this.Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, () =>
                {
                    ReactWebView2.Visibility = Windows.UI.Xaml.Visibility.Collapsed;
                    Application.Current.Exit();
                });
                Debug.WriteLine("Print completed, React app has closed.");
            }
            else
            {
                Debug.WriteLine($"Received message: {message}");
            }
        }

        private async Task SendPdfToServer(StorageFile file)
        {
            var httpClient = new System.Net.Http.HttpClient();
            var formData = new System.Net.Http.MultipartFormDataContent();
            var fileBytes = await FileIO.ReadBufferAsync(file);
            byte[] bytes;
            using (var dataReader = Windows.Storage.Streams.DataReader.FromBuffer(fileBytes))
            {
                bytes = new byte[fileBytes.Length];
                dataReader.ReadBytes(bytes);
            }
            var byteArrayContent = new System.Net.Http.ByteArrayContent(bytes);
            byteArrayContent.Headers.Add("Content-Type", "application/pdf");
            formData.Add(byteArrayContent, "pdf", file.Name);
            var response = await httpClient.PostAsync("http://localhost:3001/upload-pdf", formData);
            if (response.IsSuccessStatusCode)
            {
                var successDialog = new Windows.UI.Popups.MessageDialog("PDF sent successfully!");
                await successDialog.ShowAsync();
            }
            else
            {
                var errorDialog = new Windows.UI.Popups.MessageDialog("Failed to send PDF.");
                await errorDialog.ShowAsync();
            }
        }

        private async Task GetAndSendPdfFromAssets()
        {
            try
            {
                StorageFile file = await StorageFile.GetFileFromApplicationUriAsync(new Uri("ms-appx:///Assets/Transformer.pdf"));
                await SendPdfToServer(file);
            }
            catch (Exception ex)
            {
                var errorDialog = new Windows.UI.Popups.MessageDialog("Failed to load PDF from assets: " + ex.Message);
                await errorDialog.ShowAsync();
            }
        }
    }
}
