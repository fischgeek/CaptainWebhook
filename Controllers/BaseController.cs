using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using static System.Web.HttpContext;

namespace CaptainWebhook.Controllers
{
    public class BaseController : Controller
    {
        public JsonResult JsonAllowed(object data)
        {
            JsonResult d = this.Json(data, JsonRequestBehavior.AllowGet);
            return d;
        }

        public string GetUserIP()
        {
            string VisitorsIPAddr = string.Empty;
            if (Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"] != null) {
                VisitorsIPAddr = Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"].ToString();
            } else if (Current.Request.UserHostAddress.Length != 0) {
                VisitorsIPAddr = Current.Request.UserHostAddress;
            }
            return VisitorsIPAddr;
        }
    }
}