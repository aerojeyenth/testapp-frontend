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

    const vm = this;

    //Methods
    vm.viewUser = viewUser;
    vm.reset = reset;

    function viewUser(id) {
        //Redirects to the view page
        $window.location.href = `/view/${id}`;
    }

    function search(queryObj){

        let sort_by = queryObj.sortBy !== '' ? `&sort_by=${queryObj.sortBy}` : '';
        let order = queryObj.orderBy !== '' ? `&order=${queryObj.orderBy}` : '';

        return $http.get(`http://127.0.0.1:5000/api/v1/search/?query=${queryObj.query}${sort_by}${order}`);
    }

    //Allow only search query of more than 1 char length and 0 char length
    //0 char length to populate full table
    let minQueryLength = (text) => text.length > 1 || text.length == 0;


    //Regular Expression to match Email.
    const regx = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    // Checks if the text contains @ symbol if yes then matched for email pattern
    // This will make sure the server is hit after the completion of email input only

    let matchEmail = (text) => text.indexOf('@') >= 0 ? regx.test(text) : true;

    let getTargetValue = (e) => e.target.value;

    let defaultObj = {
        "target" : {
            "value" : ''
        }
    };

    //Getting the input element using its ID
    const input = document.getElementById("system-search");
    const sortBy = document.getElementById("sel1");
    const orderBy = document.getElementById("sel2");

    const EventObservable = Rx.Observable.fromEvent;


    //Input event stream observable
    let query$ = EventObservable(input, 'input')
        .startWith(defaultObj)
        .map(getTargetValue)
        .filter(minQueryLength)
        .filter(matchEmail)
        .delay(500) //Insert a delay of 500ms for the user to type without hitting the servers
        .distinctUntilChanged(); //This will make sure no duplicate query is sent to the server. 

    //Change event stream observable for sortBy
    let sortBy$ = EventObservable(sortBy, 'change')
                .startWith(defaultObj)
                .map(getTargetValue);

    //Change event stream observable for orderBy
    let orderBy$ = EventObservable(orderBy, 'change')
                .startWith(defaultObj)
                .map(getTargetValue);

    //Using Combine Latest to combine all the streams
    let searcherCombined$ = Rx.Observable
        .combineLatest(query$, sortBy$, orderBy$, function (query, sortBy, orderBy) {
            return {query: query, sortBy: sortBy, orderBy: orderBy}
        });


    //Converts the promise into first order observable
    let searcher$ = searcherCombined$.switchMap(search);

    // Subscribing to the response observable
    searcher$.subscribe(res => {vm.searchResults = res.data.results});

    //Manually trigger the event after reset value
    let triggerEvent = (el, ev) => { el.dispatchEvent(new Event(ev)) };


    function reset() {
        //Resetting the value to defaults
        input.value = '';
        triggerEvent(input, 'input');

        sortBy.value = 'id';
        triggerEvent(sortBy, 'change');

        orderBy.value = 'asc';
        triggerEvent(orderBy, 'change');
    }


}

