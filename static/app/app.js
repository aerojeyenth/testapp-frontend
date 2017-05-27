//Initialize an Angular App
var app = angular.module('myApp', []);


//Overriding the default interpolation to avoid conflicts with
//Python's template engine which also uses {{}}

app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});


//Controller for the app.
app.controller('appCtrl', appCtrl);

function appCtrl($http, $window) {

    var vm = this;

    //Methods
    vm.viewUser = viewUser;

    function viewUser(id) {
        //Redirects to the view page
        $window.location.href = "/view/" + id;
    }

    function search(queryObj){

        var sort_by = queryObj.sortBy !== '' ? '&sort_by=' + queryObj.sortBy : '';
        var order = queryObj.orderBy !== '' ? '&order=' + queryObj.orderBy : '';

        return $http.get('http://127.0.0.1:5000/api/v1/search/?query='+ queryObj.query + sort_by + order);
    }


    //Getting the input element using its ID
    var input = document.getElementById("system-search");
    var sortBy = document.getElementById("sel1");
    var orderBy = document.getElementById("sel2");

    //Input event stream observable
    var query$ = Rx.Observable.fromEvent(input, 'input')
        .startWith({target:{value:''}})
        .map(function (e) {
            return e.target.value;
        });

    //Change event stream observable for sortBy
    var sortBy$ = Rx.Observable.fromEvent(sortBy, 'change')
                .startWith({target:{value:'id'}})
                .map(function (e) {
                    return e.target.value;
                });
    //Change event stream observable for orderBy
    var orderBy$ = Rx.Observable.fromEvent(orderBy, 'change')
                .startWith({target:{value:'asc'}})
                .map(function (e) {
                    return e.target.value;
                });

    //Using Combine Latest to combine all the streams
    var searcherCombined$ = Rx.Observable.combineLatest(query$, sortBy$, orderBy$, function (query, sortBy, orderBy) {
        return {
            query: query,
            sortBy: sortBy,
            orderBy: orderBy
        };
    });

    //Converts the promise into first order observable
    var searcher$ = searcherCombined$.switchMap(search);

    // Subscribing to the response observable
    searcher$.subscribe(function(res) {
        vm.searchResults = res.data.results;
    });



}
