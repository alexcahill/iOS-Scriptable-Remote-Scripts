
async function GetCurrentYenRate() {
    
    var Req = new Request("https://query1.finance.yahoo.com/v6/finance/quote/marketSummary");
    var Result = await Req.loadJSON();

    if (!Result['marketSummaryResponse'])
        throw "Error, unexpected response";
    Result = Result['marketSummaryResponse'];
    if (!Result['result'] || Result['result'] == 0)
        throw "Error, no result";
    Result = Result['result'];
    for (var i = 0; i < Result.length; i++)
        if (Result[i]['currency'] && Result[i]['currency'] == "JPY")
            return Result[i]['regularMarketPrice']['raw'];
    throw "Error, JPY not in the result list";

}


