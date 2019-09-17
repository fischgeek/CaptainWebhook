namespace TrelloWebhooks {
    let v: TrelloWebhookModel

    class TrelloWebhookModel {
        NewHook = ko.observable<NewWebhook>(new NewWebhook())
        Hooks = ko.observableArray<RegisteredWebhook>()
        ReturnedHook = ko.observable<RegisteredWebhook>()
        AllBoards = ko.observableArray<TrelloBoard>()
        SelectedBoard = ko.observable<TrelloBoard>()
        AllListsOnBoard = ko.observableArray<TrelloList>()
        SelectedList = ko.observable<TrelloList>()
        AllCardsOnList = ko.observableArray<TrelloCard>()
        SelectedCard = ko.observable<TrelloCard>()

        TestURL = (d: RegisteredWebhook, el) => {
            $(el.target).find('span.spinner').addClass('spinner-grow spinner-grow-sm')
            $.ajax({
                url: "URLIsValid"
                , type: "POST"
                , data: `{"url":"${d.callbackURL}"}`
                , contentType: 'application/json'
                , dataType: "json"
                , success: (res) => {
                    console.log(res)
                    if (res == true) {
                        $(el.target).next('div.callback-test-status').removeClass('text-danger')
                        $(el.target).next('div.callback-test-status').addClass('text-success')
                        $(el.target).next('div.callback-test-status').find('span.status-message').removeClass('text-danger')
                        $(el.target).next('div.callback-test-status').find('span.status-message').addClass('text-success')
                        $(el.target).next('div.callback-test-status').find('i.material-icons').html('check_circle_outline')
                        $(el.target).next('div.callback-test-status').find('span.status-message').html('URL is valid!')
                    } else {
                        $(el.target).next('div.callback-test-status').removeClass('text-success')
                        $(el.target).next('div.callback-test-status').addClass('text-danger')
                        $(el.target).next('div.callback-test-status').find('span.status-message').removeClass('text-success')
                        $(el.target).next('div.callback-test-status').find('span.status-message').addClass('text-danger')
                        $(el.target).next('div.callback-test-status').find('i.material-icons').html('error_outline')
                        $(el.target).next('div.callback-test-status').find('span.status-message').html('URL is unreachable!')
                    }
                }
                , error: () => {
                    console.log('call failed')
                    $(el.target).next('div.callback-test-status').removeClass('text-success')
                    $(el.target).next('div.callback-test-status').addClass('text-danger')
                    $(el.target).next('div.callback-test-status').find('span.status-message').removeClass('text-success')
                    $(el.target).next('div.callback-test-status').find('span.status-message').addClass('text-danger')
                    $(el.target).next('div.callback-test-status').find('i.material-icons').html('error_outline')
                    $(el.target).next('div.callback-test-status').find('span.status-message').html('URL is unreachable!')
                }
                , complete: () => {
                    $(el.target).find('span.spinner').removeClass('spinner-grow spinner-grow-sm')
                }
            })
        }
        DeleteHook = (d: RegisteredWebhook, el) => {
            $(el.target).find('span.spinner').addClass('spinner-grow spinner-grow-sm')
            console.log('deleting hook ' + d.id)
            var url = "DeleteHook"
            var jsonData = `{"hookId":"${d.id}"}`
            $.ajax({
                type: 'POST',
                url: url,
                dataType: 'json',
                data: jsonData,
                contentType: 'application/json',
                success: (result) => {
                    console.log('success')
                    this.Hooks.remove(d);
                },
                error: (result) => {
                    console.log('error')
                },
                complete: () => {
                    $(el.target).find('span.spinner').removeClass('spinner-grow spinner-grow-sm')
                }
            })
        }
        CreateHook = (d: NewWebhook, el) => {
            $(el.target).find('span.spinner').addClass('spinner-grow spinner-grow-sm')
            var url = "CreateHook"
            var jsonData = ko.toJSON(this.NewHook())
            $.ajax({
                type: 'post',
                url: url,
                dataType: 'json',
                data: jsonData,
                contentType: 'application/json',
                success: (result) => {
                    this.ReturnedHook(result.Data)
                },
                error: (result) => {
                    console.log('error')
                },
                complete: () => {
                    $(el.target).find('span.spinner').removeClass('spinner-grow spinner-grow-sm')
                    this.NewHook(new NewWebhook())
                }
            })
        }
        CreateHookResponse = ko.computed(() => {
            if (this.ReturnedHook()) {
                return JSON.stringify(this.ReturnedHook(), null, 4)
            }
            return ""
        })
        FormatHookAsJSON = (hook: RegisteredWebhook) => {
            return JSON.stringify(hook, null, 4)
        }
        FormattedPostData = ko.computed(() => {
            return JSON.stringify({"description":this.NewHook().description(), "callbackURL":this.NewHook().callbackURL(), "idModel":this.NewHook().idModel()}, null, 4)
        })
        AskTrello = () => {
            $('#myModal').modal('show');
            var url = "GetBoards"
            $.ajax({
                type: 'get',
                url: url,
                dataType: 'json',
                contentType: 'application/json',
                success: (result) => {
                    this.AllBoards(result)
                },
                error: (result) => {
                    console.log('error')
                }
            })
        }
        AskTrelloForLists = () => {
            var url = "GetLists"
            var jsonData = `{"boardId":"${this.SelectedBoard().id}"}`
            $.ajax({
                type: 'post',
                url: url,
                dataType: 'json',
                data: jsonData,
                contentType: 'application/json',
                success: (result) => {
                    this.AllListsOnBoard(result)
                },
                error: (result) => {
                    console.log('error')
                }
            })
        }
        AskTrelloForCards = () => {
            var url = "GetCards"
            var jsonData = `{"listId":"${this.SelectedList().id}"}`
            $.ajax({
                type: 'post',
                url: url,
                dataType: 'json',
                data: jsonData,
                contentType: 'application/json',
                success: (result) => {
                    this.AllCardsOnList(result)
                },
                error: (result) => {
                    console.log('error')
                }
            })
        }
        NewHookIdModelIsPopulated = ko.computed(() => {
            return (this.NewHook().idModel() != "" && this.NewHook().idModel() !== undefined)
        })
        SelectedInfo = ko.computed(() => {
            var out = ""
            if (this.SelectedBoard()) {
                out += `Board: ${this.SelectedBoard().name} `
            }
            if (this.SelectedList()) {
                out += `-> List: ${this.SelectedList().name} `
            }
            if (this.SelectedCard()) {
                out += `-> Card: ${this.SelectedCard().name}`
            }
            return out
        })
        DescriptionFromSelectedInfo = ko.computed(() => {
            var out = ""
            if (this.SelectedBoard()) {
                out += this.SelectedBoard().name.replace(/\s/g, '')
            }
            if (this.SelectedList()) {
                out += `:${this.SelectedList().name.replace(/\s/g, '-')}`
            }
            if (this.SelectedCard()) {
                out += `:${this.SelectedCard().name.replace(/\s/g, '-')}`
            }
            this.NewHook().description(out.toLowerCase())
        })

        static BindFromData(data: any) {
            v = new TrelloWebhookModel()
            window.v = v
            var el = document.getElementById('root')
            ko.applyBindings(v, el)
            v.Hooks(data);
            v.SelectedBoard.subscribe((val) => {
                if (v.NewHookIdModelIsPopulated() || v.NewHook().idModel() != val.id) {
                    if (v.SelectedBoard() && v.SelectedBoard().id != "") {
                        v.NewHook().idModel(val.id)
                        v.AskTrelloForLists()
                        v.AllCardsOnList(null)
                    }
                }
            })
            v.SelectedList.subscribe((val) => {
                if (v.SelectedList() && v.NewHookIdModelIsPopulated()) {
                    if (v.NewHook().idModel() != val.id) {
                        v.NewHook().idModel(val.id)
                        v.AskTrelloForCards()
                    }
                }
            })
            v.SelectedCard.subscribe((val) => {
                if (v.SelectedCard() && v.NewHookIdModelIsPopulated()) {
                    if (v.NewHook().idModel() != val.id) {
                        v.NewHook().idModel(val.id)
                    }
                }
            })
        }
    }

    $(document).ready(function () {
        TrelloWebhookModel.BindFromData((window as any).Model)
        window.v = v
    })
}