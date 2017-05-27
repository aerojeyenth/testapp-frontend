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

function appCtrl($scope) {
    $scope.welcome = "Welcome to Angular!";
}

