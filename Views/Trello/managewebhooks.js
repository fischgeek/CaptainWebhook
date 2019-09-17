var TrelloWebhooks;
(function (TrelloWebhooks) {
    var v;
    var TrelloWebhookModel = (function () {
        function TrelloWebhookModel() {
            var _this = this;
            this.NewHook = ko.observable(new NewWebhook());
            this.Hooks = ko.observableArray();
            this.ReturnedHook = ko.observable();
            this.AllBoards = ko.observableArray();
            this.SelectedBoard = ko.observable();
            this.AllListsOnBoard = ko.observableArray();
            this.SelectedList = ko.observable();
            this.AllCardsOnList = ko.observableArray();
            this.SelectedCard = ko.observable();
            this.TestURL = function (d, el) {
                $(el.target).find('span.spinner').addClass('spinner-grow spinner-grow-sm');
                $.ajax({
                    url: "URLIsValid",
                    type: "POST",
                    data: "{\"url\":\"" + d.callbackURL + "\"}",
                    contentType: 'application/json',
                    dataType: "json",
                    success: function (res) {
                        console.log(res);
                        if (res == true) {
                            $(el.target).next('div.callback-test-status').removeClass('text-danger');
                            $(el.target).next('div.callback-test-status').addClass('text-success');
                            $(el.target).next('div.callback-test-status').find('span.status-message').removeClass('text-danger');
                            $(el.target).next('div.callback-test-status').find('span.status-message').addClass('text-success');
                            $(el.target).next('div.callback-test-status').find('i.material-icons').html('check_circle_outline');
                            $(el.target).next('div.callback-test-status').find('span.status-message').html('URL is valid!');
                        }
                        else {
                            $(el.target).next('div.callback-test-status').removeClass('text-success');
                            $(el.target).next('div.callback-test-status').addClass('text-danger');
                            $(el.target).next('div.callback-test-status').find('span.status-message').removeClass('text-success');
                            $(el.target).next('div.callback-test-status').find('span.status-message').addClass('text-danger');
                            $(el.target).next('div.callback-test-status').find('i.material-icons').html('error_outline');
                            $(el.target).next('div.callback-test-status').find('span.status-message').html('URL is unreachable!');
                        }
                    },
                    error: function () {
                        console.log('call failed');
                        $(el.target).next('div.callback-test-status').removeClass('text-success');
                        $(el.target).next('div.callback-test-status').addClass('text-danger');
                        $(el.target).next('div.callback-test-status').find('span.status-message').removeClass('text-success');
                        $(el.target).next('div.callback-test-status').find('span.status-message').addClass('text-danger');
                        $(el.target).next('div.callback-test-status').find('i.material-icons').html('error_outline');
                        $(el.target).next('div.callback-test-status').find('span.status-message').html('URL is unreachable!');
                    },
                    complete: function () {
                        $(el.target).find('span.spinner').removeClass('spinner-grow spinner-grow-sm');
                    }
                });
            };
            this.DeleteHook = function (d, el) {
                $(el.target).find('span.spinner').addClass('spinner-grow spinner-grow-sm');
                console.log('deleting hook ' + d.id);
                var url = "DeleteHook";
                var jsonData = "{\"hookId\":\"" + d.id + "\"}";
                $.ajax({
                    type: 'POST',
                    url: url,
                    dataType: 'json',
                    data: jsonData,
                    contentType: 'application/json',
                    success: function (result) {
                        console.log('success');
                        _this.Hooks.remove(d);
                    },
                    error: function (result) {
                        console.log('error');
                    },
                    complete: function () {
                        $(el.target).find('span.spinner').removeClass('spinner-grow spinner-grow-sm');
                    }
                });
            };
            this.CreateHook = function (d, el) {
                $(el.target).find('span.spinner').addClass('spinner-grow spinner-grow-sm');
                var url = "CreateHook";
                var jsonData = ko.toJSON(_this.NewHook());
                $.ajax({
                    type: 'post',
                    url: url,
                    dataType: 'json',
                    data: jsonData,
                    contentType: 'application/json',
                    success: function (result) {
                        _this.ReturnedHook(result.Data);
                    },
                    error: function (result) {
                        console.log('error');
                    },
                    complete: function () {
                        $(el.target).find('span.spinner').removeClass('spinner-grow spinner-grow-sm');
                        _this.NewHook(new NewWebhook());
                    }
                });
            };
            this.CreateHookResponse = ko.computed(function () {
                if (_this.ReturnedHook()) {
                    return JSON.stringify(_this.ReturnedHook(), null, 4);
                }
                return "";
            });
            this.FormatHookAsJSON = function (hook) {
                return JSON.stringify(hook, null, 4);
            };
            this.FormattedPostData = ko.computed(function () {
                return JSON.stringify({ "description": _this.NewHook().description(), "callbackURL": _this.NewHook().callbackURL(), "idModel": _this.NewHook().idModel() }, null, 4);
            });
            this.AskTrello = function () {
                $('#myModal').modal('show');
                var url = "GetBoards";
                $.ajax({
                    type: 'get',
                    url: url,
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (result) {
                        _this.AllBoards(result);
                    },
                    error: function (result) {
                        console.log('error');
                    }
                });
            };
            this.AskTrelloForLists = function () {
                var url = "GetLists";
                var jsonData = "{\"boardId\":\"" + _this.SelectedBoard().id + "\"}";
                $.ajax({
                    type: 'post',
                    url: url,
                    dataType: 'json',
                    data: jsonData,
                    contentType: 'application/json',
                    success: function (result) {
                        _this.AllListsOnBoard(result);
                    },
                    error: function (result) {
                        console.log('error');
                    }
                });
            };
            this.AskTrelloForCards = function () {
                var url = "GetCards";
                var jsonData = "{\"listId\":\"" + _this.SelectedList().id + "\"}";
                $.ajax({
                    type: 'post',
                    url: url,
                    dataType: 'json',
                    data: jsonData,
                    contentType: 'application/json',
                    success: function (result) {
                        _this.AllCardsOnList(result);
                    },
                    error: function (result) {
                        console.log('error');
                    }
                });
            };
            this.NewHookIdModelIsPopulated = ko.computed(function () {
                return (_this.NewHook().idModel() != "" && _this.NewHook().idModel() !== undefined);
            });
            this.SelectedInfo = ko.computed(function () {
                var out = "";
                if (_this.SelectedBoard()) {
                    out += "Board: " + _this.SelectedBoard().name + " ";
                }
                if (_this.SelectedList()) {
                    out += "-> List: " + _this.SelectedList().name + " ";
                }
                if (_this.SelectedCard()) {
                    out += "-> Card: " + _this.SelectedCard().name;
                }
                return out;
            });
            this.DescriptionFromSelectedInfo = ko.computed(function () {
                var out = "";
                if (_this.SelectedBoard()) {
                    out += _this.SelectedBoard().name.replace(/\s/g, '');
                }
                if (_this.SelectedList()) {
                    out += ":" + _this.SelectedList().name.replace(/\s/g, '-');
                }
                if (_this.SelectedCard()) {
                    out += ":" + _this.SelectedCard().name.replace(/\s/g, '-');
                }
                _this.NewHook().description(out.toLowerCase());
            });
        }
        TrelloWebhookModel.BindFromData = function (data) {
            v = new TrelloWebhookModel();
            window.v = v;
            var el = document.getElementById('root');
            ko.applyBindings(v, el);
            v.Hooks(data);
            v.SelectedBoard.subscribe(function (val) {
                if (v.NewHookIdModelIsPopulated() || v.NewHook().idModel() != val.id) {
                    if (v.SelectedBoard() && v.SelectedBoard().id != "") {
                        v.NewHook().idModel(val.id);
                        v.AskTrelloForLists();
                        v.AllCardsOnList(null);
                    }
                }
            });
            v.SelectedList.subscribe(function (val) {
                if (v.SelectedList() && v.NewHookIdModelIsPopulated()) {
                    if (v.NewHook().idModel() != val.id) {
                        v.NewHook().idModel(val.id);
                        v.AskTrelloForCards();
                    }
                }
            });
            v.SelectedCard.subscribe(function (val) {
                if (v.SelectedCard() && v.NewHookIdModelIsPopulated()) {
                    if (v.NewHook().idModel() != val.id) {
                        v.NewHook().idModel(val.id);
                    }
                }
            });
        };
        return TrelloWebhookModel;
    }());
    $(document).ready(function () {
        TrelloWebhookModel.BindFromData(window.Model);
        window.v = v;
    });
})(TrelloWebhooks || (TrelloWebhooks = {}));
//# sourceMappingURL=managewebhooks.js.map