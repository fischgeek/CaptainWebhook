interface IHaveIdName {
    id: string
    name: string
}
class NewWebhook {
    description = ko.observable<string>("")
    idModel = ko.observable<string>("")
    callbackURL = ko.observable<string>("http://webhooks.fischgeek.com/trello/{endpoint}")
}
class RegisteredWebhook {
    id: string
    active: boolean
    idModel: string
    description: string
    callbackURL: string
    firstConsecutiveFailDate: string
    consecutiveFailures: number
    callbackTestResult = ko.observable<string>("text-success")
}
class TrelloBoard {
    id: string
    name: string
    desc: string
    url: string
    shortUrl: string
    prefs: string
}
class TrelloList {
    id: string
    name: string
    closed: boolean
    idBoard: string
    pos: number
    subscribed: string
}
class TrelloCard {
    id: string
    name: string
    desc: string
    badges: object
    closed: boolean
    dateLastActivity: string
    due: string
    dueComplete: boolean
    idAttachmentCover: string
    idBoard: string
    idChecklists: string[]
    idLabels: string[]
    idMembers: string[]
    idShort: string
    labels: string
    pos: number
    shortLink: string
    shortUrl: string
    subscribed: boolean
    url: string
    address: string
    locationName: string
    coordinates: object
}