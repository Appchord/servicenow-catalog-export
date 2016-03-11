var fs = require('fs');
var async = require('async');
var xpath   = require('xpath');
var xmldom = require('xmldom').DOMParser;
var serializer = new (require('xmldom')).XMLSerializer;
//var implementation = new (require('xmldom')).DOMImplementation;

var inputDir = __dirname + '/data/';
var outputDir = __dirname + '/result/';

var oldDomain = '<sys_domain>f88a8b3413285200a82f745fd144b096</sys_domain>';
var newDomain = '<sys_domain>9e0c78680f8fc600b1bd0cbce1050ed8</sys_domain>';

var oldCarrier = '<x_mobi_c_carrier display_value="Verizon - 772420606">d48d6ef21328d200af03735fd144b0cf</x_mobi_c_carrier>';
var newCarrier = '<x_mobi_c_carrier>6e5215bd0f429a00f5b947bce1050ebe</x_mobi_c_carrier>';

fs.mkdirSync(outputDir, true);

//var transform = require('transform');

async.series([
	processXML,
	finalize
]);


function processXML(callback) {
	console.log('Processing XML...');

	var generateGUID = function() { return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return (v.toString(16));
	});}

	var input = inputDir + 'device.xml';
	var output = outputDir + 'deviceOutput.xml';
	var outputAttach = outputDir + 'deviceAttachOutput.xml';
	var outputAttachDoc = outputDir + 'deviceAttachDocOutput.xml';
	fs.readFile(input, 'utf-8', function (err, data) {
		if (err) {
			throw err;
		}
		doc = new xmldom().parseFromString(data, 'application/xml');
		//change item sys_id and sys_attachment/table_sys_id
		var childNodes = xpath.select('//x_mobi_c_mobile_device_catalog_item/sys_id', doc);
		if (childNodes.length == 0) {
			childNodes = xpath.select('//x_mobi_c_telecom_feature_item/sys_id', doc);
		}
		if (childNodes.length == 0) {
			childNodes = xpath.select('//x_mobi_c_telecom_plan_item/sys_id', doc);
		}
		if (childNodes.length == 0) {
			childNodes = xpath.select('//x_mobi_c_mobile_acc_catalog_item/sys_id', doc);
		}

		for (var i=0; i< childNodes.length; i++) {
			//console.log(childNodes[i].childNodes[0].nodeValue);
			var prevSysIdValue = childNodes[i].childNodes[0].nodeValue;
			var attach = xpath.select('//sys_attachment/table_sys_id', doc);
			var newItemGuid = generateGUID();
			for (var j=0; j< attach.length; j++) {
				var prevSysIdAttachValue = attach[j].childNodes[0].nodeValue;
				if (prevSysIdValue == prevSysIdAttachValue) {
					//console.log('value will be changed old='+prevSysIdValue+' new = ' + newItemGuid);
					attach[j].childNodes[0].nodeValue = newItemGuid;
					attach[j].childNodes[0].data = newItemGuid;
				}
			}
			childNodes[i].childNodes[0].nodeValue = newItemGuid;
			childNodes[i].childNodes[0].data = newItemGuid;
		}

		//change sys_attachment/sys_id and sys_attachment_doc/sys_attachment
		var childNodes = xpath.select('//sys_attachment/sys_id', doc);
		for (var i=0; i< childNodes.length; i++) {
			//console.log(childNodes[i].childNodes[0].nodeValue);
			var prevSysIdValue = childNodes[i].childNodes[0].nodeValue;
			var attach = xpath.select('//sys_attachment_doc/sys_attachment', doc);
			var newItemGuid = generateGUID();
			for (var j=0; j< attach.length; j++) {
				var prevSysIdAttachValue = attach[j].childNodes[0].nodeValue;
				if (prevSysIdValue == prevSysIdAttachValue) {
					//console.log('value will be changed old='+prevSysIdValue+' new = ' + newItemGuid);
					attach[j].childNodes[0].nodeValue = newItemGuid;
					attach[j].childNodes[0].data = newItemGuid;
				}
			}
			childNodes[i].childNodes[0].nodeValue = newItemGuid;
			childNodes[i].childNodes[0].data = newItemGuid;
		}

		var strDoc = serializer.serializeToString(doc);
		strDoc = strDoc.replace(new RegExp(oldDomain, "g"), newDomain);
		//strDoc = strDoc.replace(oldTenant, newTenant);
		strDoc = strDoc.replace(new RegExp(oldCarrier, "g"), newCarrier);

		fs.writeFile(
			output,
			strDoc,
			function(error) {
				if (error) {
					console.log(error);
				} else {
					console.log("The file was saved!");
				}
			}
		);
/*
		//create sys_attachment file
		var sysAttachNodes = xpath.select('//sys_attachment', doc);
		var newDoc = '<?xml version="1.0" encoding="UTF-8"?><unload unload_date="2016-03-09 17:12:02"></unload>';
		var document = new xmldom().parseFromString(newDoc, 'application/xml');
		for (var i=0; i< sysAttachNodes.length; i++) {
			if (sysAttachNodes[i].childNodes.length > 30 ) {
				document.childNodes[1].appendChild(sysAttachNodes[i]);
			}
		}
		fs.writeFile(
			outputAttach,
			serializer.serializeToString(document),
			function(error) {
				if (error) {
					console.log(error);
				} else {
					console.log("The file was saved!");
				}
			}
		);
		//create sys_attachment_doc file
		var sysAttachDocNodes = xpath.select('//sys_attachment_doc', doc);
		var newDoc = '<?xml version="1.0" encoding="UTF-8"?><unload unload_date="2016-03-09 17:12:02"></unload>';
		var documentAttachDoc = new xmldom().parseFromString(newDoc, 'application/xml');
		for (var i=0; i< sysAttachDocNodes.length; i++) {
			//if (sysAttachNodes[i].childNodes.length > 30 ) {
			documentAttachDoc.childNodes[1].appendChild(sysAttachDocNodes[i]);
			//}
		}
		fs.writeFile(
			outputAttachDoc,
			serializer.serializeToString(documentAttachDoc),
			function(error) {
				if (error) {
					console.log(error);
				} else {
					console.log("The file was saved!");
				}
			}
		);
*/

	});
}


function finalize(callback) {
}