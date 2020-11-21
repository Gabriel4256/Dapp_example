var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));

const contract_address = "0x02111Ef8922A32f36456636940123E637CbeD7B9";
const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "aid",
				"type": "uint256"
			}
		],
		"name": "auctionBidding",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "aid",
				"type": "uint256"
			}
		],
		"name": "auctionEnd",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address payable",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "balanceTransfer",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "uint256",
				"name": "iid",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "addr",
				"type": "address"
			}
		],
		"name": "changeItemOwner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getAllAuctionedItems",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getAllRegisteredItems",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getMyItems",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getName",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "start_price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "limit_price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "date",
				"type": "uint256"
			}
		],
		"name": "registerAuctionItem",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "registerItem",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "registerName",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

let auction = new web3.eth.Contract(abi, contract_address);

$(document).ready(function() {
	startDapp();
})

var startDapp = async function() {
	getMyItems();
	getRegisteredAuctionItems();
	getClosedAuctionItems();
	getMyItemsToBeAuctioned();
	getItemsRegisteredAtAuction();
	getName();
}


var getBalance = function() {
	var address = $('#address').text();
	web3.eth.getBalance(address, function (error, balance) {
		if (!error)
			$('#balanceAmount').text(web3.utils.fromWei(balance,'ether'));
		else
			console.log('error: ', error);
	});
}

var getName = async function() {
	var address = $('#address').text();
	var name = await auction.methods.getName().call({from: address})
	$('#name').text(name);
	return name;
}

var registerName = async function() {
	var new_name = $('#change_name').val();
	var address = $('#address').text();
	await auction.methods.registerName(new_name).send({from: address, gas: 3000000});
	$('#name').text(new_name);
	return;
}

var registerForMyItem = async function() {
	var address = $('#address').text();
	var item_name = $('#Item').val();
	await auction.methods.registerItem(item_name).send({from: address, gas: 5000000});
	return;
}

var registerAuctionItem = async function() {
	var address = $('#address').text();
	var item_name = $('#myitems-category option:selected').val();
	var start_price = parseInt($('#startingBidPrice').val()); 
	var limit_price = parseInt($('#upperLimitPrice').val());
	var date = dateToTimeStamp($('#dueDate').val());

	await auction.methods.registerAuctionItem(item_name, startDapp, limit_price, date)
			.send({from: address, gas: 5000000});
	return;
}

var auctionBidding = async function() {
	var address = $('#address').text();
	var itemId = parseInt($('#auction-category option:selected').val());
	var price = parseInt($('#bidPrice').val());
	await auction.methods.auctionBidding(itemId).send({from: address, gas: 5000000, value: price})
	return;
}

var getMyItems = async function() {
	var address = $('#address').text();
	var items = await auction.methods.getMyItems().call({from: address});
	// $("#myitems-category").html("");
	$("#myItems").html("");
	for (item of JSON.parse(items)) {
		// $('#myitems-category').append("<option value='" + item + "'>" + item + "</option>");
		$("#myItems").append("<tr><td>" + item + "</td></tr>");
	}
}

var getRegisteredAuctionItems = async function() {
	var address = $('#address').text();
	var items = await auction.methods.getAllRegisteredItems().call({from: address});
	// $("#myitems-category").html("");
	$("#registeredCars").html("");
	for (info of JSON.parse(items)) {
		// $('#myitems-category').append("<option value='" + i:00 GMT+0900 (nfo.rid + "'>" + info.item + "</option>");		
		$("#registeredCars").append(
			"<tr><td>" + info.item + "</td>" + 
			"<td>" + info.owner + "</td>" + 
			"<td>" + info.bid_price + "</td>" +
			"<td>" + info.upper_limit_price + "</td>" +
			"<td> " + timeStampTodate(info.due_date) + "</td>" + 
			"</tr>"
		);
	}
}

var getClosedAuctionItems = async function() {
	var address = $('#address').text();
	var items = await auction.methods.getAllAuctionedItems().call({from: address});
	$("#carsOnSale").html("");
	for (info of JSON.parse(items)) {
		$("#carsOnSale").append(
			"<tr><td>" + info.item + "</td>" + 
			"<td>" + info.owner + "</td>" + 
			"<td>" + info.winning_bid + "</td>" +
			"</tr>"
		);
	}
}

var getMyItemsToBeAuctioned = async function() {
	var address = $('#address').text();
	var items = await auction.methods.getMyItems().call({from: address});
	$("#myitems-category").html("");
	for (item of JSON.parse(items)) {
		$('#myitems-category').append("<option value='" + item + "'>" + item + "</option>");
	}
}

var getItemsRegisteredAtAuction = async function() {
	var address = $('#address').text();
	var items = await auction.methods.getAllRegisteredItems().call({from: address});
	$("#auction-category").html("");
	for (info of JSON.parse(items)) {
		$('#auction-category').append("<option value='" + info.rid + "'>" + info.item + "</option>");
	}
}

function dateToTimeStamp (date) {
	date = date.trim()
	let ymd = date.split(" ")[0].split("/");
	let time = date.split(" ")[1].split(":");

	let dateObject = new Date(ymd[0],  parseInt(ymd[1]) - 1, ymd[2], time[0], time[1], time[2]);
	let timestamp = dateObject.getTime();
	return timestamp;
}

function timeStampTodate (timestamp) {
	return (new Date(parseInt(timestamp)).toString());
}
