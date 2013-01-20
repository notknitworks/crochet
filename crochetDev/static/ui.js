

var foundation = true;
var toRight;

var curX;
var curY;
var curCluster;

var rows = {};
var nodes = {};
var rounds = false;


var STITCH_IMGS = {
    ch:{
        SRC:"",
        WIDTH:20,
        HEIGHT:10,
    },
    SC:{
        SRC:"",
        WIDTH:20,
        HEIGHT:20
    },
    HDC:{
        SRC:"",
        WIDTH:20,
        HEIGHT:40
    }
};
$(function() {

    //must begin by adding a row
    //every row must end with addCluster();
    // addRow();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addStitch(new Stitch("HDC"));
    // addCluster();

    // addRow();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addStitch(new Stitch("HDC"));
    // addCluster();
    // addRow();




});

    function addStitch(stitch) {
        rows[curX]['stitches']++;
        if (!toRight) {
            stitch.dir *= -1;
        }

        if (curY == 0 && !foundation) {
            stitch.prevStitch = getStitchY(curX-1, rows[curX-1]['stitches']-1);
        } else if (curY != 0) {
            stitch.prevStitch = getStitchY(curX, curY - 1);
        }

        rows[curX][curCluster].push(stitch);
        addNode(stitch);
        

        if (rows[curX][curCluster][0] == stitch && curY!=0) {
            //logic for calculating angles between clusters
            var base = distance(stitch.origin, stitch.prevStitch.origin);
            var curLeg = Math.sqrt(Math.pow(stitch.height,2) + Math.pow(stitch.width/2, 2));
            var prevLeg = Math.sqrt(Math.pow(stitch.prevStitch.height,2) + Math.pow(stitch.prevStitch.width/2, 2));
            var curAngle = getAngleFromSides(base, curLeg, prevLeg);
            var prevAngle = getAngleFromSides(base, prevLeg, curLeg);
            var slant = Math.atan((stitch.origin.posY - stitch.prevStitch.origin.posY) /
                (stitch.origin.posX - stitch.prevStitch.origin.posX) );

            var prevOriginStitch = rows[stitch.prevStitch.x][stitch.prevStitch.cluster][0];
            var prevMidpt = midpoint(prevOriginStitch.nodes[0], prevOriginStitch.nodes[1]);

            var angleBefore = stitch.prevStitch.angle - prevOriginStitch.angle;

            // var slantOffset = slant;
            // if (slant * (stitch.origin.posX - stitch.prevStitch.origin.posX) > 0) {
            //     slantOffset = -slantOffset;

            rotateStitch(stitch, stitch.origin,
                -Math.PI/2 + (curAngle -slant*stitch.dir+ Math.atan(stitch.prevStitch.width/2 / stitch.prevStitch.height)));

            var offset = Math.PI/2 - prevAngle - slant*stitch.dir- Math.atan(stitch.prevStitch.width/2 / stitch.prevStitch.height);
            if ((stitch.prevStitch.origin.posX - stitch.nodes[0].posX) * stitch.dir > 0) {
                offset = -offset;
            }
            if (rows[curX][stitch.prevStitch.cluster].length == 1 && stitch.prevStitch.cluster != 0) {
                rotateStitchesInCluster(stitch.prevStitch.x, stitch.prevStitch.cluster, (offset - stitch.prevStitch.angle)/2);
            } else {
                rotateStitchesInCluster(stitch.prevStitch.x, stitch.prevStitch.cluster, (offset - stitch.prevStitch.angle));
            }

        } else if (curY == 0 && !foundation) {
            var angle = -getStitchY(curX-1, rows[curX-1]['stitches'] - curCluster - 1).angle;
            //var angle = -stitch.prevStitch.angle;
            rotateStitch(stitch, stitch.origin, angle);
        } else if (!foundation) {
            rotateNextStitchInCluster(stitch);
            if (curCluster == 0 && !foundation) {
                rotateStitchesInCluster(curX, curCluster, -Math.atan(stitch.width/2 / stitch.height));
            }

        }

        curY++;
        addToCanvas(stitch);

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

        stitch.x = curX;
        stitch.y = curY;
        stitch.cluster = curCluster;

        if (foundation) {
            nodes[curX][curY+1] = new Node(nodes[curX][curY].posX+stitch.width,
                nodes[curX][curY].posY, curX, curY+1);
        }

        if (curY == 0) {
            //add corner node
            nodes[curX+1] = {
                0 : new Node(getNodeInPrev(curX, curCluster).posX,
                    getNodeInPrev(curX, curCluster).posY+stitch.height,
                    curX+1, 0)
            };
        }

        var origin = midpoint(getNodeInPrev(curX, curCluster), getNodeInPrev(curX, curCluster+1));

        var offset = stitch.width/2 * stitch.dir;

        stitch.nodes[0] = nodes[curX+1][curY];

        if (stitch.stType != "CH") {
            nodes[curX+1][curY+1] = new Node(origin.posX + offset,
                origin.posY+stitch.height, curX+1, curY+1);
        } else {
            // nodes[curX+1][curY+1] = new Node(origin.posX + offset,
            //     origin.posY+Math.max(stitch.prevStitch.height, 0), curX+1, curY+1);
            nodes[curX+1][curY+1] = new Node(nodes[curX+1][curY].posX,
                nodes[curX+1][curY].posY, curX+1, curY+1);
        }

        stitch.nodes[1] = nodes[curX+1][curY+1];
        stitch.nodes[2] = getNodeInPrev(curX, curCluster+1);
        stitch.nodes[3] = getNodeInPrev(curX, curCluster);

        stitch.setOrigin();

        stitch.top = stitch.origin.posY + stitch.height;
        stitch.left = stitch.origin.posX - stitch.width/2;
    }

    function addChain() {

        var stitch;
        if (curY == 0) {
            stitch = new Stitch("CH");
            stitch.prevStitch = getStitchY(curX-1, rows[curX-1]['stitches']-1);
        } else if (getStitchY(curX, curY - 1).stType != "CH") {
            stitch = new Stitch("CH");
            stitch.prevStitch = getStitchY(curX, curY-1);
        } else {
            curY--;
            stitch = getStitchY(curX, curY);
        }
        if (stitch.chains.length == 0) {
            if (!toRight) {
                stitch.dir *= -1;
            }
            rows[curX][curCluster].push(stitch);
            rows[curX]['stitches']++;
            stitch.width = STITCH_IMGS['ch']['WIDTH'];
            stitch.height = stitch.prevStitch.height;

            addNode(stitch);
            rotateNextStitchInCluster(stitch);
            alignNodes(stitch.nodes[1], stitch.nodes[0]);
        }
        addChainTo(stitch);


        curY++;
    }

    function addChainTo(stitch) {
        var chain = new Chain();
        if (!toRight) {
            chain.dir *= -1;
        }
        stitch.chains.push(chain);
        chain.stitch = stitch;
        stitch.div.append(chain.div);

        chain.x = curX;
        chain.y = curY;
        chain.chIndex = stitch.chains.length - 1;
        chain.cluster = curCluster;

        chain.top = 0;
        chain.left = chain.width * chain.chIndex;


        if (chain.stitch.angle > 0) {
            nodes[curX+1][curY+1].posX += chain.width * Math.cos(chain.stitch.angle)*chain.dir;
            nodes[curX+1][curY+1].posY -= chain.width * Math.sin(chain.stitch.angle);
        } else {
            nodes[curX+1][curY+1].posX += chain.width * Math.cos(chain.stitch.angle)*chain.dir;
            nodes[curX+1][curY+1].posY += chain.width * Math.sin(Math.abs(chain.stitch.angle));
        }

        addToCanvas(chain);
    }

    function addChNode(chain) {


        if (stitch.angle > 0) {
            nodes[curX+1][curY+1] = new Node(nodes[curX][curY].posX + stitchNum * stitch.width * Math.cos(prevAngle)*stitch.dir,
                nodes[curX][curY].posY - stitchNum * stitch.width * Math.sin(prevAngle));
        } else {
            nodes[curX+1][curY+1] = new Node(nodes[curX][curY].posX + stitchNum * stitch.width * Math.cos(prevAngle)*stitch.dir,
                nodes[curX][curY].posY + stitchNum * stitch.width * Math.sin(prevAngle));
        }

        stitch.nodes[0] = nodes[curX+1][curY];
        stitch.nodes[1] = nodes[curX+1][curY+1];
    }

    function addRow() {
        //foundation will not get set to false until second row is added
        if (typeof curX != "undefined") {
            if (foundation) {
                removeCluster();
                foundation = false;
            }
            rows[curX]['clusters']++;
            curX++;
            toRight = !toRight;
        } else {
            //first node
            nodes[0] = {
                0:new Node($("#interface").width()/4, $("#interface").height()/2, 0, 0)
            };
            curX = 0;
            toRight = true;
        }

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
    function removeCluster() {
        delete rows[curX][curCluster]
        curCluster--;
        rows[curX]['clusters'] = curCluster;
    }
    function skipStitch() {
        if (rows[curX][curCluster].length != 0) {
            addCluster();
            addCluster();
        } else {
            addCluster();
        }
    }

    function rotateNextStitchInCluster(stitch) {
        /*
        *Function to line up next stitch in a cluster with the corner of the previous.
        */
        var midpt = midpoint(stitch.prevStitch.nodes[0], stitch.prevStitch.nodes[1]);
        var angle1 = Math.atan((midpt.posX - stitch.origin.posX) / (midpt.posY - stitch.origin.posY));
        rotateStitch(stitch, stitch.origin, angle1 * stitch.dir);
        //average of previous and current stitches' angles from origin to top corners
        var angle2 = Math.atan(stitch.width/2 / stitch.height) +
            getAngleFromSides(
                distance(midpt, stitch.origin),
                distance(stitch.origin, stitch.nodes[0]),
                distance(midpt, stitch.nodes[0])
                );
        rotateStitch(stitch, stitch.origin, angle2);
    }

    function rotateStitch(stitch, origin, angle) {
        /*
        *Rotates stitch by some angle. Positive angle direction is direction in which stitch faces.
        *Rotates nodes[1] by angle as well. Nodes[0] is also rotated if first in row.
        */
        stitch.angle += angle;
        angle *= stitch.dir;
        rotateNode(stitch.nodes[1], origin, angle);
        if (stitch.y == 0) {
            rotateNode(stitch.nodes[0], origin, angle);
        }
        addToCanvas(stitch);
    }

    function rotateStitchesInCluster(row, clusterNum, angle) {
        /*
        *Rotate all stitches in a cluster by some angle.
        *if multiple stitches in cluster, each stitch will rotate until last stitch in cluster has rotated by angle.
        *if one stitch in cluster, or if first in row, entire cluster will rotate by angle.
        */
        var cluster = rows[row][clusterNum];
        var origin = cluster[0].origin;
        if (clusterNum == 0 || cluster.length == 1) {
            for (stitch in cluster) {
                rotateStitch(cluster[stitch], origin, angle);
            }
        } else {
            for (stitch in cluster) {
                rotateStitch(cluster[stitch], origin, angle / (cluster.length - 1) * stitch);
            }
        }
    }

    function rotateNode(node, origin, angle) {
        var vectorX = node.posX - origin.posX;
        var vectorY = node.posY - origin.posY;

        var rotatedX = vectorX * Math.cos(angle) + vectorY * Math.sin(angle);
        var rotatedY = vectorX * -Math.sin(angle) + vectorY * Math.cos(angle);

        node.posX = origin.posX + rotatedX;
        node.posY = origin.posY + rotatedY;

    }

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
    function getStitchY(row, y) {
        if (y >= rows[row]['stitches'] || row < 0 || y < 0) {
            console.log("error getting stitch "+y+" row "+row);
            return null;
        }
        var cluster = 0;
        var clusterIndex = 0;
        var stitch = rows[row][0][0];
        try {
            while (y >= 0) {
                while (clusterIndex==rows[row][cluster].length) {
                    cluster++;
                    clusterIndex = 0;
                }
                stitch = rows[row][cluster][clusterIndex];
                y--;
                clusterIndex++;
            }
        } finally {
            return stitch;
        }
    }
    function getAngleFromSides(a, b, c) {
        return Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2*a*b));
    }
    function getSideFromAngle(a, b, angleC) {
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) - 2*a*b*Math.cos(angleC));
    }


    function Node(posX, posY, x, y) {
        // this.x = x;
        // this.y = y;
        this.posX = posX;
        this.posY = posY;
    }

    function Stitch(stitch) {
        this.chains = [];
        this.stType = stitch;
        this.prevStitch = null;
        this.origin;
        this.x;
        this.y;
        this.cluster;
        if (stitch != "CH") {
        this.width = STITCH_IMGS[this.stType]["WIDTH"];
            this.height = STITCH_IMGS[this.stType]["HEIGHT"];
        }
        this.nodes = {};
        this.angle = 0;
        this.dir = 1;
        this.top;
        this.left;
        this.div = $("<div></div>");
        var self = this;
        this.div.css('position', 'absolute');
        if (stitch!="CH") {
            this.div.css({
                "background-color":"gray",
                "opacity":"0.5"
            });
        }

        this.setOrigin = setOrigin;

        function setOrigin() {
            this.origin = midpoint(this.nodes[2], this.nodes[3]);
                this.div.css({"transform-origin":"50% 100%",
                    "-ms-transform-origin":"50% 100%", /* IE 9 */
                    "-webkit-transform-origin":"50% 100%", /* Safari and Chrome */
                    "-moz-transform-origin":"50% 100%", /* Firefox */
                    "-o-transform-origin":"50% 100%", /* Opera */
                });

        }
    }
    function Chain() {
        this.stType = "ch";
        this.x;
        this.y;
        this.cluster;
        this.chIndex;
        this.stitch;
        this.prevChain;
        this.top;
        this.left;
        this.dir = 1;
        this.angle = 0;
        this.nodes = {};
        this.width = STITCH_IMGS["ch"]["WIDTH"];
        this.height = STITCH_IMGS["ch"]["HEIGHT"];
        var self = this;
        this.div = $("<div></div>");
        this.div.css({'position':'absolute',
                "width":self.width,
                "height":self.height,
                "background-color":"gray",
                "border":"solid gray 1px",
                "opacity":"0.5",
                "-ms-transform-origin":"0 0", /* IE 9 */
                "-webkit-transform-origin":"0 0", /* Safari and Chrome */
                "-moz-transform-origin":"0 0", /* Firefox */
                "-o-transform-origin":"0 0" /* Opera */
        });

    }

    function addToCanvas(stitch) {
        var self = stitch;
        if (stitch.stType == "ch") {
            stitch.div.css("top",stitch.top);
        } else {
            stitch.div.css("top", 600-stitch.top);
            $("#interface").append(stitch.div);
        }

        if (Math.abs(stitch.angle) < 1e-5) {
            stitch.angle = 0;
        }
            stitch.div.css({
                "left":stitch.left,
                "width":stitch.width,
                "height":stitch.height,
                "transform": "rotate("+stitch.dir*stitch.angle*180/Math.PI+"deg)",
                "-ms-transform": "rotate("+stitch.dir*stitch.angle*180/Math.PI+"deg)", /* IE 9 */
                "-webkit-transform": "rotate("+stitch.dir*stitch.angle*180/Math.PI+"deg)", /* Safari and Chrome */
                "-moz-transform": "rotate("+stitch.dir*stitch.angle*180/Math.PI+"deg)", /* Firefox */
                "-o-transform": "rotate("+stitch.dir*stitch.angle*180/Math.PI+"deg)" /* Opera */
            });


    }


//DEBUGGING METHODS
console.log("yay");
console.log(getStitchY(1, 8));

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

function distance(node1, node2) {
    return Math.sqrt(Math.pow(node1.posX - node2.posX, 2) +
            Math.pow(node1.posY - node2.posY, 2));
}

function midpoint(node1, node2) {
    return {
        "posX":node1.posX + (node2.posX - node1.posX) / 2,
        "posY":node1.posY + (node2.posY - node1.posY) / 2
    };
}
function alignNodes(node1, node2) {
    /**
    *Set node1 to node2's position
    */
    node1.posX = node2.posX;
    node1.posY = node2.posY;
}
function makeNodeAt(node) {
    /**
    *Create a fake node object at same coordinates as node
    */
    return {
        'posX':node.posX,
        'posY':node.posY
    };
}