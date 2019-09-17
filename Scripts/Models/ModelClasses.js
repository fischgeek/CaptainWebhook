var NewWebhook = (function () {
    function NewWebhook() {
        this.description = ko.observable("");
        this.idModel = ko.observable("");
        this.callbackURL = ko.observable("http://webhooks.fischgeek.com/trello/{endpoint}");
    }
    return NewWebhook;
}());
var RegisteredWebhook = (function () {
    function RegisteredWebhook() {
        this.callbackTestResult = ko.observable("text-success");
    }
    return RegisteredWebhook;
}());
var TrelloBoard = (function () {
    function TrelloBoard() {
    }
    return TrelloBoard;
}());
var TrelloList = (function () {
    function TrelloList() {
    }
    return TrelloList;
}());
var TrelloCard = (function () {
    function TrelloCard() {
    }
    return TrelloCard;
}());
//# sourceMappingURL=ModelClasses.js.map