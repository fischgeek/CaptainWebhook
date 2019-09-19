using System.Web.Mvc;
using System.IO;
using Newtonsoft.Json;
using SharedLibrary;
using System.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using TrelloUtility;
using TheMovieDBClassLibrary;

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
            var returnString = string.Empty;
            if (!string.IsNullOrEmpty(json)) {
                var hook = JsonConvert.DeserializeObject<Hook>(json);
                ProcessWebhook(hook);
                if (hook.action.type == "createCard") {
                    returnString = JsonConvert.SerializeObject(hook, Formatting.Indented);
                    System.IO.File.WriteAllText($@"{Server.MapPath("~/hooks.json")}", returnString);
                }
            }
            return View(model: returnString);
        }

        public void ProcessWebhook(Hook hook)
        {
            switch (hook.model.name) {
                case "FischFlicks":
                    if (hook.action.type == HookAction.createCard.ToString()) {
                        var tb = FireUpTrello();
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
                    }
                    break;
                default:
                    break;
            }
        }

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
        createCard
    }
}