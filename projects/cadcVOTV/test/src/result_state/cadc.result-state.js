test("Serialize table state to an url", 12, function()
{
    // Minimal parameters.
    var resultState = new cadc.web.ResultState();
    var baseUrl = "http://localhost.com";
    var queryUrl = "/search?Observation.target.name=alpha%20beta&foo=bar";
    var sortColumn, sortDirection, columns, widths, filters, units;

    var actual = resultState.getResultStateUrl(baseUrl, queryUrl, sortColumn,
            sortDirection, columns, widths,
            filters, units);
    var expected = baseUrl + queryUrl + "&SOP&EOP";

    ok(actual, "url should not be empty");
    equal(actual, expected, "Incorrect url returned");

    // Add sort column and direction.
    sortColumn = "foo";
    sortDirection = "dsc";

    actual = resultState.getResultStateUrl(baseUrl, queryUrl, sortColumn,
            sortDirection, columns, widths,
            filters, units);
    expected = baseUrl + queryUrl + "&SOP&sortCol=foo&sortDir=dsc&EOP";

    ok(actual, "url should not be empty");
    equal(actual, expected, "Incorrect url returned");

    // Add array of column ID's.
    columns = [{id: "id1"}, {id: "id2"}, {id: "id3"}];

    actual = resultState.getResultStateUrl(baseUrl, queryUrl, sortColumn,
            sortDirection, columns, widths,
            filters, units);
    expected = baseUrl + queryUrl + "&SOP&sortCol=foo&sortDir=dsc&col_1=id1;;;&col_2=id2;;;&col_3=id3;;;&EOP";

    ok(actual, "url should not be empty");
    equal(actual, expected, "Incorrect url returned");

    // Add column widths
    widths = {id1: 75, id3: 150};

    actual = resultState.getResultStateUrl(baseUrl, queryUrl, sortColumn,
            sortDirection, columns, widths,
            filters, units);
    expected = baseUrl + queryUrl + "&SOP&sortCol=foo&sortDir=dsc&col_1=id1;75;;&col_2=id2;;;&col_3=id3;150;;&EOP";

    ok(actual, "url should not be empty");
    equal(actual, expected, "Incorrect url returned");

    // Add columns filters
    filters = {id2: "id2 filter", id3: "id3 filter"};

    actual = resultState.getResultStateUrl(baseUrl, queryUrl, sortColumn,
            sortDirection, columns, widths,
            filters, units);
    expected = baseUrl + queryUrl + "&SOP&sortCol=foo&sortDir=dsc&col_1=id1;75;;&col_2=id2;;id2%20filter;&col_3=id3;150;id3%20filter;&EOP";

    ok(actual, "url should not be empty");
    equal(actual, expected, "Incorrect url returned");

    // Add units
    units = {id1: "H:M:S", id2: "km/s"};

    actual = resultState.getResultStateUrl(baseUrl, queryUrl, sortColumn,
            sortDirection, columns, widths,
            filters, units);
    expected = baseUrl + queryUrl + "&SOP&sortCol=foo&sortDir=dsc&col_1=id1;75;;H:M:S&col_2=id2;;id2%20filter;km/s&col_3=id3;150;id3%20filter;&EOP";

    ok(actual, "url should not be empty");
    equal(actual, expected, "Incorrect url returned");
});

test("Parse the query url and state parts", 4, function()
{
    var resultState = new cadc.web.ResultState();

    var url = "http://localhost/search?foo=bar";
    var actual = resultState.parseQueryUrl(url);

    ok(actual, "Query url should not be empty");
    equal(actual, url, "Query url does not match");

    url = "http://localhost/search?foo=bar&SOP&a=b&EOP";
    var actual = resultState.parseQueryUrl(url);

    ok(actual, "Query url should not be empty");
    equal(actual, "http://localhost/search?foo=bar", "Query url does not match");
});

test("Deserialize an url to voview options", 16, function()
{
    var resultState = new cadc.web.ResultState();
    var expected = {};

    // Missing start of parameters parameter.
    var baseUrl = "http://localhost.com/search?Observation.target.name=alpha%20beta&foo=bar";
    var url = baseUrl;
    var actual = resultState.getViewerOptions(url);

    ok(actual, "State should not be undefined or null");
    deepEqual(actual, expected, "State does not match");

    // Missing end of parameters parameter.
    url += "&SOP&a=b&c=d";
    actual = resultState.getViewerOptions(url);
    expected.error = "End of url parameter &" + cadc.web.END_OF_PARAMETERS + " not found";

    ok(actual, "State should not be undefined or null");
    deepEqual(actual, expected, "State does not match");

    // No recognized state parameters.
    url += "&EOP&e=f";
    actual = resultState.getViewerOptions(url);
    expected = {};

    ok(actual, "State should not be undefined or null");
    deepEqual(actual, expected, "State does not match");

    // State parameters with sort column and direction.
    url = baseUrl + "&SOP&sortCol=foo&sortDir=asc&EOP";
    actual = resultState.getViewerOptions(url);
    expected = {};
    expected.sortColumn = "foo";
    expected.sortDir = "asc";

    ok(actual, "State should not be undefined or null");
    deepEqual(actual, expected, "State does not match");

    // State parameters with columns id's.
    url = baseUrl + "&SOP&sortCol=foo&sortDir=asc&col_1=id1&col_3=id3&col_2=id2&EOP";
    actual = resultState.getViewerOptions(url);
    expected = {};
    expected.sortColumn = "foo";
    expected.sortDir = "asc";
    expected.displayColumns = ["id1", "id2", "id3"];

    ok(actual, "State should not be undefined or null");
    deepEqual(actual, expected, "State does not match");

    // State parameter with id's and widths.
    url = baseUrl + "&SOP&sortCol=foo&sortDir=asc&col_1=id1;50&col_3=id3;;;&col_2=id2;75&EOP";
    actual = resultState.getViewerOptions(url);
    expected = {};
    expected.sortColumn = "foo";
    expected.sortDir = "asc";
    expected.displayColumns = ["id1", "id2", "id3"];
    expected.columnOptions =
            {
                id1: {width: "50"},
                id2: {width: "75"}
            };

    ok(actual, "State should not be undefined or null");
    deepEqual(actual, expected, "State does not match");

    // State parameters with id's, width, filters.
    url = baseUrl + "&SOP&sortCol=foo&sortDir=asc&col_1=id1;50;filter%201&col_3=id3;;filter%203;&col_2=id2;75&EOP";
    actual = resultState.getViewerOptions(url);
    expected = {};
    expected.sortColumn = "foo";
    expected.sortDir = "asc";
    expected.displayColumns = ["id1", "id2", "id3"];
    expected.columnOptions = {id1: {width: "50"}, id2: {width: "75"}};
    expected.columnFilters = {id1: "filter 1", id3: "filter 3"};

    ok(actual, "State should not be undefined or null");
    deepEqual(actual, expected, "State does not match");

    // State parameters with id's, width, filters, and units.
    url = baseUrl + "&SOP&sortCol=foo&sortDir=asc&col_1=id1;50;filter%201&col_3=id3;;filter%203;km/s&col_2=id2;75&EOP";
    actual = resultState.getViewerOptions(url);
    expected = {};
    expected.sortColumn = "foo";
    expected.sortDir = "asc";
    expected.displayColumns = ["id1", "id2", "id3"];
    expected.columnOptions =
            {
                id1: {width: "50"},
                id2: {width: "75"},
                id3: {header: {
                        units: [{label: "km/s", value: "km/s", default: true}]
                    }
                }
            };
    expected.columnFilters = {id1: "filter 1", id3: "filter 3"};

    ok(actual, "State should not be empty");
    deepEqual(actual, expected, "State does not match");
});

test("Merge url viewer options into a default viewer options", 1, function()
{
    var defaultOptions =
    {
        sortColumn: "bar",
        sortDir: "dsc",
        columnOptions:
        {
            id2:
            {
                width: "100"       
            },
            id3:
            {
                width: "100",
                header: {units: [{label: "m/s", value: "m/s", default: true}]}
            }
        },
        columnFilters: {id1: "default filter", id3: "default filter"},
        displayColumns: ["col1", "col2", "col3"]
    };
    
    var expectedOptions =
    {
        sortColumn: "foo",
        sortDir: "asc",
        columnOptions:
        {
            id1:
            {
                width: "50"
            },
            id2:
            {
                width: "75"       
            },
            id3:
            {
                width: "100",
                header: {units: [{label: "km/s", value: "km/s", default: true}]}
            }
        },
        columnFilters: {id1: "filter 1", id3: "filter 3"},
        displayColumns: ["id1", "id2", "id3"]
    };
    
    var baseUrl = "http://localhost.com/search?Observation.target.name=alpha%20beta&foo=bar";
    var url = baseUrl + "&SOP&sortCol=foo&sortDir=asc&col_1=id1;50;filter%201&col_3=id3;;filter%203;km/s&col_2=id2;75&EOP";
    
    var resultState = new cadc.web.ResultState();
    var urlOptions = resultState.getViewerOptions(url);
    
    $.extend(true, defaultOptions, urlOptions);
    
    deepEqual(defaultOptions, expectedOptions, "Objects do not match");
});