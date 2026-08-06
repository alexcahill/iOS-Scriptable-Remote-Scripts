

const ConversionLossRate = (315781 - 2071) / 315781; //estimated...
const FILE_NAME = "Info.json";
const FSO = FileManager.local();

var Parameters = {
    Capital: 0,
    USD: 0,
    JPY: 0,
    Interest: 0,
    AVG: 0,
    AVGT: 0,
    Fees: 0
};


async function GetCurrentBid() { // In Yen

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


console.log(await GetCurrentBid());

/*

function floor(Number, Places = 2) {

    if (isNaN(Number))
        Number = 0;
    return (Math.floor(Number * (10 ** Places)) / (10 ** Places)).toLocaleString('en-US', {
        minimumFractionDigits: Math.max(Places, 0),
        maximumFractionDigits: Math.max(Places, 0)
    });
}

function Notify(Text, Title) {
    var N = new Notification();
    N.body = Text;
    if (Title)
        N.title = Title;
    N.schedule();
}

function NotifyError(Text) {
    Notify(Text, "Error");
    Script.complete();
}

function ParseCSV(String) {
    try {
        var [bInQuotes, LastIndex, bFirstChar, Table, Line] = [0, 0, true, [], []];
        for (var i = 0; i < String.length; i++) {
            if (!!bInQuotes) {
                if (String[i] == '"' && String[i + 1] != '"')
                    if (String[i + 1] != ',' && String[i + 1] != '\n')
                        throw "Error at char[" + i + "]";
                    else;
                else continue;
            }
            else {
                if (String[i] == '"')
                    if (bFirstChar) {
                        bInQuotes = 1;
                        bFirstChar = false;
                        continue;
                    }
                    else
                        throw "Error at char[" + i + "], '\"' Detected mid data, outside of quotes, & unescaped.";
                else if (String[i] != ',' && String[i] != '\n') {
                    bFirstChar = false;
                    continue;
                }
            }
            Line.push(String.substr(LastIndex + bInQuotes, i - LastIndex - bInQuotes));
            LastIndex = i + 1 + bInQuotes;
            if (!!bInQuotes)
                i++, bInQuotes = 0;
            bFirstChar = true;
            if (String[i] == '\n')
                Table.push(Line), Line = [];
        }
        this.RawData = Table;
        this.ColumnLenght = (Table.length ? Table[0].length : 0),
            this.Enteries = Math.max(Table.length - 1, 0);
        this.IndexOf = (String) => {
            if (!this.Enteries)
                return -1;
            else
                return this.RawData[0].indexOf(String);
        };
        this.HasColumn = (String) => {
            return this.IndexOf(String) != -1;
        };
        this.At = (Column, Row) => {
            if (Column < 0 || Row < 0 || Column >= this.ColumnLenght || Row >= this.Enteries)
                throw "Error Index out of bounds";
            return this.RawData[Row + 1][Column];
        };
        this.Data = (ColumnString, Row) => {
            var Index = this.IndexOf(ColumnString);
            if (!Index)
                throw "Error No Column with given string";
            return this.At(Index, Row);
        };
    } catch (e) { NotifyError("Error In ParseCSV -> " + e.toString()); }
}



// --- DecodeWiseCSV handler ---
// 
// To create widget Parameters...
if (args.plainTexts.length) {
    try {


        var [Cap, USD, JPY, Int, AVGRT, AVGT, Fee] = [0, 0, 0, 0, 0, 0, 0];

        var CSV = new ParseCSV(args.plainTexts[0]);

        for (var i = 0; i < CSV.Enteries; i++) {
            if (CSV.Data("Transaction Details Type", i) === "BALANCE_INTEREST")
                Int += parseFloat(CSV.Data("Amount", i));
            else if (CSV.Data("Transaction Details Type", i) === "MONEY_ADDED")
                Cap += (parseFloat(CSV.Data("Amount", i)) + parseFloat(CSV.Data("Total fees", i)));
            else if (CSV.Data("Transaction Details Type", i) === "CONVERSION" && CSV.Data("Exchange To", i) === "JPY") {
                JPY += parseFloat(CSV.Data("Exchange To Amount", i));
                var Amount = (parseFloat(CSV.Data("Amount", i)) - parseFloat(CSV.Data("Total fees", i))) * -1;
                AVGT += Amount;
                AVGRT += parseFloat(CSV.Data("Exchange Rate", i)) * Amount;
            }


            Fee += parseFloat(CSV.Data("Total fees", i));
        }

        AVG = AVGRT / AVGT;
        USD = parseFloat(CSV.Data("Running Balance", 0))

        // Save Details
        Parameters.Capital = Cap;
        Parameters.USD = USD;
        Parameters.JPY = JPY;
        Parameters.Interest = Int;
        Parameters.AVG = AVG;
        Parameters.AVGT = AVGT;
        Parameters.Fees = Fee;
        FSO.write(FSO.documentsDirectory() + "/" + FILE_NAME, Data.fromString(JSON.stringify(Parameters)));
        Notify("Enjoy the new Numbers 😉", "Thx for the Update!");
        Script.complete();

    } catch (e) { NotifyError(e.toString()); }
}

else if (config.runsInWidget) {

    function C(color) { return new Color(color, 1); }
    function v(element) { var t = element.addStack(); t.layoutVertically(); return t };
    function h(element) { var t = element.addStack(); t.layoutHorizontally(); return t };
    function t(element, text, fontSize, color) { var t = element.addText(text); if (fontSize) { t.font = Font.boldRoundedSystemFont(fontSize); } if (color) { t.textColor = color; } return t; }
    function c(element, text, fontSize, color) { var _t = t(element, text, fontSize, color); _t.centerAlignText(); return _t; }
    function l(element, text, fontSize, color) { var _t = t(element, text, fontSize, color); _t.leftAlignText(); return _t; }
    function r(element, text, fontSize, color) { var _t = t(element, text, fontSize, color); _t.rightAlignText(); return _t; }
    function s(element, spacing) { var t = element.addSpacer(spacing); return t; }

    if (FSO.fileExists(FSO.documentsDirectory() + "/" + FILE_NAME))
        Parameters = JSON.parse(FSO.readString(FSO.documentsDirectory() + "/" + FILE_NAME));
    else
        Notify("\nPlease \"✅\" on USD only.\nPlease \"✅\" CSV file format.\nPlease \"✅\" the display transactions with fees seperately.", "Upload a bank statement to get your Numbers!");

    const GRAY = C("A0A0AA");
    const GREEN = C("34C759");
    const RED = C("FF3B30");
    const FONT = 12;
    const C_MARGIN = 30;
    var w = new ListWidget();
    w.backgroundColor = C("141414");
    var body = v(w)

    var l1 = h(body);
    var l1l = h(l1);
    var l1cm = s(l1, C_MARGIN);
    var l1r = h(l1);
    var tCap = l(l1l, "Capital:", FONT, GRAY);
    s(l1l);
    var tCapVal = r(l1l, "$" + floor(Parameters.Capital), FONT - 1, GRAY);
    var tAVG = l(l1r, "AVG:", FONT, GRAY);
    s(l1r); args
    var tAVGVal = r(l1r, "¥" + floor(Parameters.AVG), FONT - 1, GRAY);

    var l2 = h(body);
    var l2l = h(l2);
    var l2cm = s(l2, C_MARGIN);
    var l2r = h(l2);
    var tUSD = l(l2l, "USD:", FONT, GRAY);
    s(l2l);
    var tUSDVal = r(l2l, "$" + floor(Parameters.USD), FONT - 1, GRAY);
    var tNAVG = l(l2r, "NAVG:", FONT, GRAY);
    s(l2r);
    var tNAVGVal = r(l2r, "¥--", FONT - 1, GRAY);

    var l3 = h(body);
    var l3l = h(l3);
    var l3cm = s(l3, C_MARGIN);
    var l3r = h(l3);
    var tJPY = l(l3l, "JPY:", FONT, GRAY);
    s(l3l);
    var tJPYVal = r(l3l, "¥" + floor(Parameters.JPY, 0), FONT - 1, GRAY);
    var tBID = l(l3r, "BID:", FONT, GRAY);
    s(l3r);
    var tBIDVal = r(l3r, "¥--", FONT - 1, GRAY);

    var l4 = h(body);
    var l4l = h(l4);
    var l4cm = s(l4, C_MARGIN);
    var l4r = h(l4);
    var tInt = l(l4l, "Interest:", FONT, GRAY);
    s(l4l);
    var tIntVal = r(l4l, "$" + floor(Parameters.Interest), FONT - 1, GRAY);
    var tFees = l(l4r, "Fees:", FONT, GRAY);
    s(l4r);
    var tFeesVal = r(l4r, "$" + floor(Parameters.Fees), FONT - 1, GRAY);

    var l5 = h(body);
    var tFXG = l(l5, "FXG:", FONT, GRAY);
    s(l5);
    var tFXGP = c(l5, "%--", FONT);
    s(l5);
    var tFXGVal = r(l5, "$--", FONT);

    var l6 = h(body);
    var tPL = l(l6, "P/L:", FONT, GRAY);
    s(l6);
    var tPLP = l(l6, "%--", FONT);
    s(l6);
    var tPLVal = l(l6, "$--", FONT);

    s(body, 4);
    var l7 = h(body);
    var tNET = l(l7, "NET:", 30);
    tNET.textColor = C("FFFFFF")
    s(l7);
    var tNETVal = r(l7, "$--", 30);
    tNETVal.font = tNET.font = Font.regularSystemFont(30);
    // Script.setWidget(w);

    var BID = await GetCurrentBid();
    tBIDVal.text = "¥" + floor(BID);
    var NAVG = (Parameters.AVG * Parameters.AVGT + BID * Parameters.USD) / (Parameters.USD + Parameters.AVGT);
    tNAVGVal.text = "¥" + floor(NAVG);
    tNAVGVal.textColor = (NAVG > Parameters.AVG ? GREEN : NAVG < Parameters.AVG ? RED : GRAY);


    var NET = Parameters.USD + Parameters.JPY / BID * ConversionLossRate;
    tNETVal.text = "$" + floor(NET);
    tNETVal.textColor = (NET > Parameters.Capital ? GREEN : NET < Parameters.Capital ? RED : GRAY);

    var FXG = NET - Parameters.Capital - Parameters.Interest + Parameters.Fees;
    tFXGVal.text = "$" + floor(FXG);
    tFXGP.textColor = tFXGVal.textColor = (FXG > 0 ? GREEN : FXG < 0 ? RED : GRAY);
    var FXGP = FXG / (Parameters.Capital - Parameters.Interest + Parameters.Fees) * 100;
    tFXGP.text = "%" + floor(FXGP, 1);

    var PL = NET - Parameters.Capital;
    tPLVal.text = "$" + floor(PL);
    tPLP.textColor = tPLVal.textColor = (PL > 0 ? GREEN : PL < 0 ? RED : GRAY);
    var PLP = PL / Parameters.Capital * 100;
    tPLP.text = "%" + floor(PLP, 1)



    Script.setWidget(w);
    w.presentMedium()

}

else {

    console.log(await GetCurrentBid())
    Safari.open("shortcuts://run-shortcut?name=Refresh%20Widgets")
}

Script.complete();

*/