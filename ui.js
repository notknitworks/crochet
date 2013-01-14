$(function() {
    var CTRX = $("#container").width();
    var CTRY = $("#container").height();

    var foundation = true;
    var toRight;
    var turning;

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
            WIDTH:20,
            HEIGHT:40
        }
    };

    //must begin by adding a row
    addRow();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addRow();
    addStitch(new Stitch("HDC"));
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addRow();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addStitch(new Stitch("HDC"));
/*
    function getRowStitchesLength(row) {
        if (typeof curX == "undefined") {
            //if no stitches have been added yet, there is no last stitch in row
            return null;
        } else {
            return rows[row]['stitches'];
        }
    }
    function getRowClustersLength(row) {
        if (typeof curX == "undefined") {
            //if no stitches have been added yet, there is no last stitch in row
            return null;
        } else {
            return rows[row]['clusters'];
        }
    }
    */

    function getNodeInPrev(row, i) {
        /*
        Returns node directly underneath node of x = row + 1 and cluster = i
        */
        if (!foundation) {
            return nodes[row][rows[row - 1]['stitches'] - i];
        } else {
            return nodes[row][i];
        }
    }

    function addStitch(stitch) {
        addNode(stitch);

        rows[curX][curCluster].push(stitch);
        stitch.x = curX;
        stitch.y = curY;
        stitch.cluster = curCluster;
        curY++;
        rows[curX]['stitches'] = curY;

        stitch.place();
    }
    function addNode(stitch) {
        /*Node convention

        addNode will give stitch references to 4 nodes using stitch.nodes object

        Node[0] of a stitch will always refer to the upper node of a stitch furthest from the next stitch. Node[1]
        is the upper node of a stitch adjacent to next stitch. Node[2] is below this. Node[3] is below node[0].
        If stitch is added while crocheting to right, node[0] refers to upper left corner. All following nodes are
        added in clockwise direction.
        If "" to left, node[0 ]refers to upper right corner. "" are added in counterclockwise direction.
        Every node will have reference to 4 stitches in node.stitches. Node's stitches[0] is previous stitch in row with same number as node,
        stitches[1] is next stitch, node.stitches[2] as next stitch in previous row, node.stitches[3] as previous stitch in previous row.
        Nodes at edge will only use stitches[0] and stitches[3]. Nodes in foundation (nodes[0]) will only use stitches[0] and stitches[1].
        A node adjacent to a cluster will only have reference to last stitch in cluster.

        Stitches in same cluster will originally have nodes positioned directly on top of each other
        */

        if (foundation) {
            nodes[curX][curY+1] = new Node(parseInt(nodes[curX][curY].posX)+parseInt(stitch.width),
                nodes[curX][curY].posY, curX, curY+1);
        }

        if (turning) {
            //add corner node
            nodes[curX+1] = {
                0 : new Node(getNodeInPrev(curX, curCluster).posX,
                    parseInt(getNodeInPrev(curX, curCluster).posY)+parseInt(stitch.height),
                    curX+1, 0)
            };
            turning = false;
        }

        if (toRight) {
            nodes[curX+1][curY+1] = new Node(parseInt(getNodeInPrev(curX, curCluster).posX)+parseInt(stitch.width),
                parseInt(getNodeInPrev(curX, curCluster).posY)+parseInt(stitch.height), curX+1, curY+1);
        } else {
            nodes[curX+1][curY+1] = new Node(parseInt(getNodeInPrev(curX, curCluster).posX)-parseInt(stitch.width),
                parseInt(getNodeInPrev(curX, curCluster).posY)+parseInt(stitch.height), curX+1, curY+1);
        }

        stitch.nodes[0] = nodes[curX+1][curY];
        stitch.nodes[1] = nodes[curX+1][curY+1];
        stitch.nodes[2] = getNodeInPrev(curX, curCluster+1);
        stitch.nodes[3] = getNodeInPrev(curX, curCluster);

        getNodeInPrev(curX, curCluster+1).stitches[0] = stitch;
        getNodeInPrev(curX, curCluster).stitches[1] = stitch;
        nodes[curX+1][curY+1].stitches[2] = stitch;
        nodes[curX+1][curY].stitches[3] = stitch;

    }

    function addRow() {
        //foundation will not get set to false until second row is added
        if (typeof curX != "undefined") {
            foundation = false;
            rows[curX]['clusters']++;
            curX++;
            toRight = !toRight;
        } else {
            //first node
            nodes[0] = {
                0:new Node($("#container").width()/2, $("#container").height()/2, 0, 0)
            };
            curX = 0;
            toRight = true;
        }

        turning = true;

        curCluster = 0;
        curY = 0;
        rows[curX] = {
            0:new Array(),
            'clusters':0,
            'stitches':0
        };

    }

    function addCluster() {
        curCluster++;
        rows[curX][curCluster] = new Array();
        rows[curX]['clusters'] = curCluster;
    }
    function skipStitch() {
        addCluster();
        addCluster();
    }

    //takes in three nodes (vertex, left, right) to determine vertex's position and adjacent
    //stitches' angles, legs a and b of triangle
    //side a is opposite angleA, side b is opposite angleB
    function triangleNodes(node, nodePrev, nodeNext, a, b) {
        //var a = node.stitches[3].height;
        //var b = node.stitches[2].height;
        var c = distance(nodeNext, nodePrev);

        var angleSlant = Math.atan((nodeNext.posY - nodePrev.posY) /
            (nodeNext.posX - nodePrev.posX));

        var angleA = Math.acos((Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2))/(2*b*c));
        var angleB = Math.acos((Math.pow(a, 2) + Math.pow(c, 2) - Math.pow(a, 2))/(2*a*c));

        /*need to check logic for whether or not toRight!!!
        node.stitches[3].angle = angleA + angleSlant;
        node.stitches[2].angle = Math.PI/2 - (angleB - angleSlant);*/

        node.posX = nodePrev.posX + b * Math.cos(angleA) * Math.cos(angleSlant) -
            h * Math.sin(angleSlant);
        node.posY = nodePrev.posY + b * Math.cos(angleA) * Math.sin(angleSlant) +
            h * Math.cos(angleSlant);

       return [angleA, angleB];

    }

    function positionCluster(cluster) {
        var start = cluster[0].nodes[0];
        for (var i=1; i < cluster.length; i++) {
            var stitch = cluster[i];
            var prevStitch = cluster[i-1];
            alignNodes(stitch.nodes[0], prevStitch.nodes[1]);
            alignNodes(stitch.nodes[2], prevStitch.nodes[2]);
            alignNodes(stitch.nodes[3], prevStitch.nodes[3]);
        }
    }

    function alignNodes(node1, node2) {
        node1.posX = node2.posX;
        node1.posY = node2.posY;
    }

    function Node(posX, posY, x, y) {
        this.x = x;
        this.y = y;
        this.posX = posX;
        this.posY = posY;
        this.stitches = {};
        this.stitches[0];
        this.stitches[1];
        this.stitches[2];
        this.stitches[3];

    }

    function Stitch(stitch) {
        this.stitch = stitch;
        this.x;
        this.y;
        this.cluster;
        this.width = STITCH_IMGS[this.stitch]["WIDTH"];
        this.height = STITCH_IMGS[this.stitch]["HEIGHT"];
        this.nodes = {};
        this.nodes[0];
        this.nodes[1];
        this.nodes[2];
        this.nodes[3];
        this.angle = 0;
        this.top;
        this.left;
        this.div = $("<div></div>");
        var self = this;
        this.div.css({'position':'absolute',
                "width":self.width,
                "height":self.height,
                "border":"solid gray 1px",
                "background-color":"gray",
                "opacity":"0.5"
                //"background-image":"url('"+STITCH_IMGS[self.stitch]["SRC"]+"')",
                //"background-size":"cover",
                /*"-webkit-transform": "rotate("+self.angle+"deg)",
                 "-moz-transform": "rotate("+self.angle+"deg)",
                  "-ms-transform": "rotate("+self.angle+"deg)",
                   "-o-transform": "rotate("+self.angle+"deg)",
                      "transform": "rotate("+self.angle+"deg)"*/
        });

        this.place = place;
        this.setPos = setPos;

        //call this function to position stitch once all nodes are in place
        function place() {
             var pt0 = midpoint(this.nodes[0], this.nodes[1]);
             var pt1 = midpoint(this.nodes[1], this.nodes[2]);
             var pt2 = midpoint(this.nodes[2], this.nodes[3]);
             var pt3 = midpoint(this.nodes[3], this.nodes[0]);

            //refers to angle from y-axis of this (angle needed to rotate)
            this.angle = Math.atan((pt0.posX - pt2.posX) / (pt0.posY - pt2.posY));

             var m1 = (pt0.posY - pt2.posY) / (pt0.posX - pt2.posX);
             var b1 = -m1 * pt0.posX + pt0.posY;
             var m2 = (pt1.posY - pt3.posY) / (pt1.posX - pt3.posX);
             var b2 = -m2 * pt1.posX + pt1.posY;

             var ctrX;
             var ctrY;
             if (m1==Infinity) {
                ctrX = pt0.posX;
                ctrY = m2*ctrX + b2;
             } else if (m2==Infinity) {
                ctrX = pt1.posY;
                ctrY = m1*ctrX + b1;
             } else if (isNaN(m1)) {
                ctrX = pt0.posX;
                ctrY = pt0.posY;
            } else if (isNaN(m2)) {
                ctrX = pt1.posX;
                ctrY = pt1.posY;
            } else {
                ctrX = (b1 - b2) / (-m1 + m2);
                ctrY = (m2*b1 - m1*b2) / (-m1 + m2);
             }
            this.setPos(ctrX, ctrY);

            console.log("adding stitch (" + this.x +", " + this.y+") "+
             "to canvas at ("+ctrX+", "+ctrY+")");

        }

        function setPos(ctrX, ctrY) {
            this.top = 600 - (ctrY + this.height);
            this.left = ctrX - this.width/2;
            var self = this;
            this.div.css({"top":self.top,
                "left":self.left});

            $("#container").append(this.div);

        }

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


//DEBUGGING METHODS
console.log("yay");

for (node in nodes) {
    printNodesInRow(node);
}



//HELPER FUNCTIONS FOR DEBUGGING
function printStitchesAtNode(x,y) {
    for (stitch in nodes[x][y].stitches) {
        console.log(stitch + " : ("+nodes[x][y].stitches[stitch].x + ", "+nodes[x][y].stitches[stitch].y + ")");
    }
}
function printNodesInRow(row) {
    console.log("printing nodes for row "+row);
    for (node in nodes[row]) {
        console.log("node "+node+": (" + nodes[row][node].posX + ", " + nodes[row][node].posY + ")");
    }
}
function printNodesAtStitch(stitch) {
    console.log("printing nodes for stitch ("+stitch.x+", "+stitch.y+")");
    for (node in stitch.nodes) {
        console.log("node "+node+": (" + stitch.nodes[node].posX + ", " + stitch.nodes[node].posY + ")");
    }
}

});

function distance(node1, node2) {
    return Math.sqrt(Math.pow(node1.posX - node2.posX, 2) +
            Math.pow(node1.posY - node2.posY), 2);
}

function midpoint(node1, node2) {
    return {
        "posX":node1.posX + (node2.posX - node1.posX) / 2,
        "posY":node1.posY + (node2.posY - node1.posY) / 2
    };
}