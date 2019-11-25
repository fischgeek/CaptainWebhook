using System.Web.Mvc;
using System.IO;
using Newtonsoft.Json;
using SharedLibrary;
using System.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using TrelloConnect;
using TheMovieDBClassLibrary;
using System.Text.RegularExpressions;
using System;

namespace CaptainWebhook.Controllers
{
    public class TrelloController : BaseController
    {
        private string token = ConfigurationManager.AppSettings["trelloapitoken"];
        private string key = ConfigurationManager.AppSettings["trelloapikey"];
        private string mkey = ConfigurationManager.AppSettings["themoviedbapikey"];

        public string TrelloBaseURL => "https://api.trello.com/1";
        public string WebhookRegisterURL => $"https://api.trello.com/1/tokens/{token}/webhooks/?key={key}";
        public ActionResult Index() => RedirectToAction("ManageWebhooks");

        public ActionResult ManageWebhooks()
        {
            var req = WebCall.GetRequestWithErrorHandling(WebhookRegisterURL);
            var hooks = new List<RegisteredWebhook>();
            if (req.IsSuccessful) {
                hooks = JsonConvert.DeserializeObject<List<RegisteredWebhook>>(req.Data);
            }
            var x = from h in hooks
                    select new {
                        h.id
                        , h.active
                        , h.idModel
                        , h.description
                        , h.callbackURL
                        , h.firstConsecutiveFailDate
                        , h.consecutiveFailures
                    };
            return View(model: JsonConvert.SerializeObject(x, Formatting.Indented));
        }

        public ActionResult ParseWebhook()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var returnString = "nothing to see here. carry on.";
            var stamp = DateTime.Now.Ticks.ToString();
            System.IO.File.WriteAllText($@"{Server.MapPath($"~/raw/{stamp}.json")}", json);
            if (!string.IsNullOrEmpty(json)) {
                var hook = JsonConvert.DeserializeObject<Hook>(json);
                returnString = JsonConvert.SerializeObject(hook, Formatting.Indented);
                System.IO.File.WriteAllText($@"{Server.MapPath($"~/hooks/{stamp}.json")}", returnString);
                Log(hook.action.type);
                ProcessWebhook(hook);
                if (hook.action.type == "createCard") {
                    returnString = JsonConvert.SerializeObject(hook, Formatting.Indented);
                    System.IO.File.WriteAllText($@"{Server.MapPath("~/createCard.json")}", returnString);
                }
            }
            return View(model: returnString);
        }

        public void ProcessWebhook(Hook hook)
        {
            Log(hook.action.type);
            var tb = FireUpTrello();
            switch (hook.model.name) {
                case "FischFlicks":
                    if (hook.action.type == HookAction.createCard.ToString()) {
                        var mb = FireUpMovieDB();
                        var targetCard = hook.action.data.card;
                        var title = mb.GetMovieTitle(targetCard.name);
                        var desc = mb.GetMovieDescription(targetCard.name);
                        var posterUrl = mb.GetMoviePosterUrl(targetCard.name);
                        tb.UpdateCardName(targetCard.id, title);
                        tb.UpdateCardDescription(targetCard.id, desc);
                        tb.AddAttachment(targetCard.id, posterUrl);
                    }
                    break;
                case "Legos":
                    if (hook.action.type == HookAction.createCard.ToString()) {
                        var legoUrl = "https://www.lego.com/biassets/bi/";
                        var bricksetExportUrl = "https://brickset.com/exportscripts/instructions";
                        var res = WebCall.GetRequest(bricksetExportUrl);
                        var pdf = string.Empty;
                        var match = Regex.Match(res, $@"({hook.action.data.card.name}-1)(.*bi\/)(.*.pdf)");
                        if (match.Success) {
                            pdf = match.Groups[3].Value;
                        }
                        if (!string.IsNullOrEmpty(pdf)) {
                            legoUrl = legoUrl + pdf;
                            tb.AddAttachment(hook.action.data.card.id, legoUrl);
                            var proc = System.Diagnostics.Process.Start("cmd.exe", "magick identify --version >> magick.txt");
                            proc.Close();
                        }
                    }
                    break;
                case "Current Projects":
                    if (hook.action.type == HookAction.createCard.ToString()) {
                        var listName = hook.action.data.list.name;
                        if (listName.JFIsNotNull() && listName == "Current Projects") {
                            AddChecklistToCard(hook.action.data.card.id);
                        }
                    }
                    break;
                case "fischgeek":
                    if (hook.action.type == HookAction.createCheckItem.ToString()) {

                    }
                    break;
                case "Receipts":
                    if (hook.action.type == HookAction.addAttachmentToCard.ToString()) {
                        Log(hook.action.type);
                        Log("Removing attachment cover.");
                        tb.RemoveCoverImage(hook.action.data.card.id);
                    }
                    break;
                default:
                    break;
            }
        }

        public void Log(string msg) => System.IO.File.AppendAllText(Server.MapPath("~/log/log.txt"), $"[{DateTime.Now.ToShortDateString()}_{DateTime.Now.ToShortTimeString()}] {msg}\n");

        public ActionResult URLIsValid(string url) => JsonAllowed(WebCall.URLIsValid(url));

        public ActionResult DeleteHook(string hookId)
        {
            var url = $"{TrelloBaseURL}/webhooks/{hookId}?key={key}&token={token}";
            var res = WebCall.DeleteRequest(url);
            return JsonAllowed(res);
        }

        public ActionResult CreateHook(NewWebhook newWebhook) => JsonAllowed(WebCall.PostRequestWithErrorHandling(WebhookRegisterURL, newWebhook));

        public ActionResult GetBoards() => JsonAllowed(FireUpTrello().GetBoards().Data);

        public ActionResult GetLists(string boardId) => JsonAllowed(FireUpTrello().GetLists(boardId).Data);

        public ActionResult GetCards(string listId) => JsonAllowed(FireUpTrello().GetCards(listId).Data);

        public ActionResult AddChecklistToCard(string cardId)
        {
            var url = $"{TrelloBaseURL}/cards/{cardId}/checklists?key={key}&token={token}";
            var res = WebCall.PostRequest(url, new { name = "Next Actions" });
            return JsonAllowed(res);
        }

        private TrelloBase FireUpTrello()
        {
            var tb = TrelloBase.GetInstance();
            tb.Init(key, token);
            return tb;
        }
        private MovieBase FireUpMovieDB()
        {
            var mb = MovieBase.GetInstance();
            mb.Init(mkey);
            return mb;
        }
    }

    public class NewWebhook
    {
        public string description { get; set; }
        public string idModel { get; set; }
        public string callbackURL { get; set; }
    }

    public class ReturnObj
    {
        public string Status { get; set; }
        public string Msg { get; set; }
    }

    public enum HookAction
    {
        createCard,
        createCheckItem,
        addAttachmentToCard
    }
}