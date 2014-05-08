
var uptime = angular.module('uptime', []);
var listAllChecksUrl = "https://api.nodeping.com/api/1/checks?token=LGZKU220-82GX-44F4-8QRB-9TQSZYJ7LS88";

uptime.controller('ServerListCtrl', function($scope,  $http){
	$http.get(listAllChecksUrl).success(function(data){
		$scope.servers = data;
	});
});
