# A simple real world test

http = require 'http'
kit = require 'nokit'
bluebird = require 'bluebird'

server = http.createServer (req, res) ->
	res.end()

request = (fn) ->
	addr = server.address()
	req = http.request {
		host: addr.address
		port: addr.port
	}, (res) ->
		res.resume()
		res.on 'end', fn
	req.end()

bluebirdReq = ->
	new bluebird (resolve) ->
		request resolve

server.listen 0, ->
	bluebirdReq().then ->
		console.log 'ok'
