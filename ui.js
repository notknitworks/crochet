$(function() {
    var CTRX = $("#container").width();
    var CTRY = $("#container").height();

    var foundation = true;
    var toRight;

    var curX;
    var curY;
    var curCluster;

    var rows = {};
    //var angles = {
        //0: []
    //}
    var nodes = {};
    var rounds = false;
    var STITCH_IMGS = {
        CH:{
            SRC:"http://carlylovesfashion.files.wordpress.com/2012/01/rectangle.gif",
            WIDTH:0,
            HEIGHT:0,
        },
        SC:{
            SRC:"http://carlylovesfashion.files.wordpress.com/2012/01/rectangle.gif",
            WIDTH:2,
            HEIGHT:5
        },
        HDC:{
            SRC:"rectangle.gif",
            WIDTH:"20",
            HEIGHT:"100"
        }
    };

    addRow();
    addStitch(new Stitch("HDC"));
    addRow();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addStitch(new Stitch("HDC"));
    skipStitch();
    addStitch(new Stitch("HDC"));


    //adds proper number of blank arrays to next row
    //returns # of nodes in next row
    function setNextRowNodes(curRow) {
        var lengthNodes = rows[curRow].reduce(function(a, b) {
            return a.concat(b);
        }).length;
        for (var i=0; i < lengthNodes; i++) {
            rows[curRow+1].push(new Array());
        }
        return lengthNodes
    }

    //gets stitch (x,y), ignoring what cluster it's in
    function getStitchAt(x, y) {
        return rows[x].reduce(function(a,b) {
            return a.concat(b);
        })[y];
    }
    function getStitchAtCluster(x, y) {
        return rows[x][y];
    }
    function addStitch(stitch) {
        addNode(stitch);

        rows[curX][curCluster].push(stitch);
        stitch.x = curX;
        stitch.y = curY;
        stitch.cluster = curCluster;
        curY++;
    }
    function addNode(stitch) {
        if (foundation) {
            nodes[curX][curY+1] = new Array(nodes[curX][curY][0]+stitch.width, nodes[curX][curY][1]);
        }
        if (toRight) {
            nodes[curX+1][curY+1] = new Array(nodes[curX][curY][0]+stitch.width, nodes[curX][curY][1]+stitch.height);
        } else {
            nodes[curX+1][curY+1] = new Array(nodes[curX][curY][0]0-stitch.width, nodes[curX][curY][1]+stitch.height);
        }
    }

    function addRow() {
        if (!foundation || curX ==0) {
            foundation = false;
            curX++;
            toRight = !toRight;
        } else {
            nodes[0] = {
                0:new Array($("#container").width()/2, $("#container").height()/2)
            };
            curX = 0;
            toRight = true;
        }
        curCluster = 0;
        curY = 0;
        rows[curX] = {
            0:new Array()
        };
        nodes[curX+1] = {
            0:new Array(2)
        };

    }
    function addCluster() {
        curCluster++;
        rows[curX][curCluster] = new Array();
    }
    function skipStitch() {
        addCluster();
        addCluster();
    }

    function Stitch(stitch) {
        this.stitch = stitch;
        this.x;
        this.y;
        this.cluster;
        this.width = STITCH_IMGS[this.stitch]["WIDTH"];
        this.height = STITCH_IMGS[this.stitch]["HEIGHT"];


        //pos[stX][stY] = [0,0];
        //angles[stX][stY] = 0;
/*
        this.setPos = setPos;
        this.setAngle = setAngle;
        this.addToCanvas = addToCanvas;

        function getCenterFromR() {
        }
        function getCenterFromL() {

        }

        function setPos(coordX, coordY) {
            pos[this.x][this.y] = [coordX, coordY];
        }

        function setAngle(angle) {
            angles[this.x][this.y] = angle;
        }

        function addToCanvas() {

            var self = this;
            var img = $("<div></div>");

            img.css({'position':'relative',
                    'left':pos[self.x][self.y][0],
                    'top':pos[self.x][self.y][1],
                    "width":self.width,
                    "height":self.height,
                    "background-image":"url('"+STITCH_IMGS[self.stitch]["SRC"]+"')",
                    "background-size":"cover",
                    "-webkit-transform": "rotate("+self.angle+"deg)",
                     "-moz-transform": "rotate("+self.angle+"deg)",
                      "-ms-transform": "rotate("+self.angle+"deg)",
                       "-o-transform": "rotate("+self.angle+"deg)",
                          "transform": "rotate("+self.angle+"deg)"
            });

            $("#container").append(img);

        }
        */
    }

console.log("yay");    //stitch.addToCanvas(45);


});

