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

    function search(query){
        return $http.get('http://127.0.0.1:5000/api/v1/search/?query='+ query);
    }

    //Getting the input element using its ID
    var input = document.getElementById("system-search");

    //Input event stream observable
    var keyups$ = Rx.Observable.fromEvent(input, 'keyup')
        .map(function (e) {
            return e.target.value;
        });

    //Converts the promise into first order observable
    var searcher = keyups$.switchMap(search);

    //Subscribing to the response observable
    searcher.subscribe(function(res) {
        vm.searchResults = res.data.results;
    });



}

