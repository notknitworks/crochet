
var c;
var cX;
var cY;

var theta = Math.PI/6;
var chWidth = 20;
var chHeight = 10;
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

    c = $("canvas")[0].getContext("2d");
    c.fillStyle = "gray";
    c.globalAlpha = 0.5;
    cX = $("canvas").attr("width")/2;
    cY = $("canvas").attr("height")/2;
    c.translate(cX, cY);

    //must begin by adding a row
    //every row must end with addCluster();
    addRow();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addCluster();
    addStitch(new Stitch("HDC"));
    addCluster();

    addRow();
    addStitch(new Stitch("HDC"));
    addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));

    // skipStitch();
    // skipStitch();
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    // skipStitch();
    // skipStitch();
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    // addRow();
    // skipStitch();
    // // skipStitch();
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    // // skipStitch();
    // skipStitch();
    // skipStitch();
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    // skipStitch();
    // skipStitch();
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    // addStitch(new Stitch("HDC"));
    addChain();
    addChain();
    addChain();
    // skipStitch();
    // skipStitch();
    // addStitch(new Stitch("HDC"));

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

            var offset = Math.PI/2 - prevAngle - slant*stitch.dir- Math.atan(stitch.prevStitch.width/2 / stitch.prevStitch.height);
            if (rows[curX][stitch.prevStitch.cluster].length == 1 && stitch.prevStitch.cluster != 0) {
                rotateStitchesInCluster(stitch.prevStitch.x, stitch.prevStitch.cluster, (offset - stitch.prevStitch.angle)/2);
            } else {
                rotateStitchesInCluster(stitch.prevStitch.x, stitch.prevStitch.cluster, (offset - stitch.prevStitch.angle));
            }

            rotateStitchAdd(stitch,
                -Math.PI/2 + (curAngle -slant*stitch.dir+ Math.atan(stitch.prevStitch.width/2 / stitch.prevStitch.height)));

        } else if (curY == 0 && !foundation) {
            var angle = -getStitchY(curX-1, rows[curX-1]['stitches'] - curCluster - 1).angle;
            //var angle = -stitch.prevStitch.angle;
            rotateStitchAdd(stitch, angle);
        } else if (!foundation) {


            if (stitch.prevStitch.stType == 'CH') {
                var chain = stitch.prevStitch;
                var angle = chain.chains.length * theta;
                // rotateStitch(stitch, chain.prevStitch.angle);
                // rotateStitch(stitch, angle);

                if (chain.prevStitch.x == chain.x) {
                    var chord = getSideFromAngle(
                        chain.prevStitch.height,
                        stitch.height,
                        angle
                        );
                    // chain.left -= (chord - chain.width)/2;
                    // chain.width = chord;
                    // rotateStitch(chain, -chain.angle);
                    // rotateNextStitchInCluster(chain);
                    adjustChWidth(chain, chord);
                    rotateNextStitchInCluster(stitch);

                    console.log(chord);
                    console.log(distance(chain.nodes[0], chain.nodes[1]));

                    var slant = Math.atan((chain.nodes[1].posY - chain.nodes[0].posY) /
                        (chain.nodes[1].posX - chain.nodes[0].posX) );
                    var midpt = midpoint(chain.nodes[0], chain.nodes[1]);
                    var midpt2 = {
                        'posX':Math.abs((chain.nodes[1].posX - chain.nodes[0].posX))/2,
                        'posY':Math.abs((chain.nodes[1].posY - chain.nodes[0].posY))/2
                    }
                    var radius = Math.sqrt(Math.pow(chord,2) + Math.pow(chWidth,2))/2;
                    var chAngle = getAngleFromSides(radius, radius, chWidth);

                    for (ch in chain.chains) {
                        chain.chains[ch].top = midpt2.posY - chHeight/2;
                        chain.chains[ch].left = midpt2.posX - chWidth/2;

                        //rotateChain(chain.chains[ch], -Math.PI/2 + chAngle/2);
                        rotateChain(chain.chains[ch], chAngle * (parseInt(chain.chains.length/2) - parseInt(ch)));
                    }


                }

            } else {
                rotateNextStitchInCluster(stitch);
                if (rows[curX][curCluster][0].y == 0 && !foundation) {
                    rotateStitchesInCluster(curX, curCluster, -Math.atan(stitch.width/2 / stitch.height));
                }
            }
        }

        curY++;
        // addToCanvas(stitch);

    }

    function rotateChain(ch, angle) {
        ch.angle += angle;
            ch.div.css({
                "transform": "rotate("+ch.dir*ch.angle*180/Math.PI+"deg)",
                "-ms-transform": "rotate("+ch.dir*ch.angle*180/Math.PI+"deg)", /* IE 9 */
                "-webkit-transform": "rotate("+ch.dir*ch.angle*180/Math.PI+"deg)", /* Safari and Chrome */
                "-moz-transform": "rotate("+ch.dir*ch.angle*180/Math.PI+"deg)", /* Firefox */
                "-o-transform": "rotate("+ch.dir*ch.angle*180/Math.PI+"deg)" /* Opera */
            });
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
            // rotateNextStitchInCluster(stitch);
            rotateStitchAdd(stitch, stitch.prevStitch.angle);

            alignNodes(stitch.nodes[1], stitch.nodes[0]);
        }
        addChainTo(stitch);


        curY++;
    }

    function addChainTo(stitch) {
        var chain = new Chain(stitch);

        chain.x = curX;
        chain.y = curY;
        chain.chIndex = stitch.chains.length - 1;
        chain.cluster = curCluster;

        adjustChWidth(stitch, chWidth * (chain.chIndex+1));
    }

    function adjustChWidth(stitch, width) {
        rotateStitch(stitch, -stitch.angle);
        nodes[curX+1][curY+1].posX += (stitch.width - width)/2;
        stitch.width = width;
        removeStitchesAfter(stitch);
        rotateStitch(stitch, stitch.prevStitch.angle);
    }

    function addRow() {
        //foundation will not get set to false until second row is added
        if (typeof curX != "undefined") {
            if (foundation) {
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

    function removeStitchesAfter(stitch) {
        //also deletes current stitch
        if (stitch.y > 0) {
            restoreCanvasToStitch(getStitchY(stitch.x, stitch.y - 1))
        } else if (stitch.x > 0) {
            restoreCanvasToStitch(getStitchY(stitch.x-1, rows[stitch.x-1]['stitches']-1));
        } else {
            restoreCanvasToStitch({ x:-1, y:-1});
        }
    }

    function rotateNextStitchInCluster(stitch) {
        /*
        *Function to line up next stitch in a cluster with the corner of the previous.
        */
        var midpt = midpoint(stitch.prevStitch.nodes[0], stitch.prevStitch.nodes[1]);
        var angle1 = Math.atan((midpt.posX - stitch.origin.posX) / (midpt.posY - stitch.origin.posY));
        //average of previous and current stitches' angles from origin to top corners
        var angle2 = Math.atan(stitch.width/2 / stitch.height) +
            getAngleFromSides(
                distance(midpt, stitch.origin),
                distance(stitch.origin, stitch.nodes[0]),
                distance(midpt, stitch.nodes[0])
                );
        rotateStitchAdd(stitch, angle1 * stitch.dir + angle2);
    }

    function rotateStitch(stitch, angle) {
        /*
        *Rotates stitch by some angle. Positive angle direction is direction in which stitch faces.
        *Rotates nodes[1] by angle as well. Nodes[0] is also rotated if first in row.
        */
        rotateStitchNodes(stitch, angle);
        restoreCanvasToStitch(stitch);
    }

    function rotateStitchAdd(stitch, angle) {
        rotateStitchNodes(stitch, angle);
        addToCanvas(stitch);
    }
    function rotateStitchNodes(stitch, angle) {
        stitch.angle += angle;
        angle *= stitch.dir;
        rotateNode(stitch.nodes[1], stitch.origin, angle);
        if (stitch.y == 0) {
            rotateNode(stitch.nodes[0], stitch.origin, angle);
        }
    }


    function rotateStitchesInCluster(row, clusterNum, angle) {
        /*
        *Rotate all stitches in a cluster by some angle.
        *if multiple stitches in cluster, each stitch will rotate until last stitch in cluster has rotated by angle.
        *if one stitch in cluster, or if first in row, entire cluster will rotate by angle.
        */
        var cluster = rows[row][clusterNum];
        // rotateStitch(cluster[0], origin, angle);
        if (rows[row][clusterNum][0].y == 0 || cluster.length == 1) {
            for (stitch in cluster) {//.slice(1)) {
                rotateStitch(cluster[stitch], angle);
            }
        } else {
            for (stitch in cluster) {//.slice(1)) {
                rotateStitch(cluster[stitch], angle / (cluster.length - 1) * (stitch));
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
        this.params;
        this.cluster;
        if (stitch != "CH") {
        this.width = STITCH_IMGS[this.stType]["WIDTH"];
            this.height = STITCH_IMGS[this.stType]["HEIGHT"];
        }
        this.nodes = {};
        this.angle = 0;
        this.dir = 1;
        this.div = $("<div></div>");
        var self = this;
        this.setOrigin = setOrigin;

        function setOrigin() {
            this.origin = midpoint(this.nodes[2], this.nodes[3]);

        }
    }
    function Chain(stitch) {
        this.stType = "ch";
        this.x;
        this.y;
        this.params;
        this.cluster;
        this.chIndex;
        this.stitch = stitch;
        this.stitch.chains.push(this);
        this.prevChain;
        this.dir = stitch.dir;
        this.angle = 0;
        this.nodes = {};
        this.width = STITCH_IMGS["ch"]["WIDTH"];
        this.height = STITCH_IMGS["ch"]["HEIGHT"];
        var self = this;

    }

    function addToCanvas(stitch) {

        // if (stitch.y == 0 && stitch.prevStitch!=null) {
        //     cY -= stitch.prevStitch.height;
        //     c.translate(0, -stitch.prevStitch.height);
        // }

        var prevOrigin;
        if (rows[stitch.x][stitch.cluster][0] == stitch && !(stitch.y == 0 && stitch.x == 0)) {
            if (stitch.y != 0) {
                prevOrigin = stitch.prevStitch.origin;
            } else if (stitch.x != 0) {
                prevOrigin = getStitchY(stitch.x-1, rows[stitch.x-1]['stitches']-1).origin;
                //midpoint(getStitchY(stitch.x - 1, rows[stitch.x-1]['stitches']-1).nodes[2],
                // getStitchY(stitch.x - 1, rows[stitch.x-1]['stitches']-1).nodes[3]);
            }
            cX += stitch.origin.posX - prevOrigin.posX;
            cY -= stitch.origin.posY - prevOrigin.posY
            c.translate(stitch.origin.posX - prevOrigin.posX,
                -(stitch.origin.posY - prevOrigin.posY));
        }

        if (stitch.stType == "CH") {
            if (getStitchY(stitch.x, rows[stitch.x]['stitches']-1) == stitch) {
                addHangingChains(stitch);
            }

        } else {
            c.rotate(stitch.dir*stitch.angle);
            c.fillRect(-stitch.width / 2, -stitch.height, stitch.width, stitch.height);
            c.rotate(-stitch.dir*stitch.angle);
            c.save();
        }
    }

    function addHangingChains(stitch) {
        xOffset = (stitch.width + stitch.prevStitch.width)/2 * stitch.dir * Math.cos(Math.abs(stitch.angle));
        yOffset = (stitch.width + stitch.prevStitch.width)/2 * Math.sin(stitch.angle);
        c.translate(xOffset, yOffset);
        c.rotate(stitch.dir * stitch.angle);
        for (ch in stitch.chains) {
            if (stitch.dir == 1) {
                c.fillRect(-stitch.dir*(stitch.width / 2 - parseInt(ch)*stitch.chains[ch].width), -stitch.height - stitch.chains[ch].height/2,
                stitch.chains[ch].width, stitch.chains[ch].height);
            } else {
                c.fillRect(-stitch.dir*(stitch.width / 2 - (parseInt(ch)+1)*stitch.chains[ch].width), -stitch.height - stitch.chains[ch].height/2,
                stitch.chains[ch].width, stitch.chains[ch].height);
            }
        }
        // c.fillRect(-stitch.width/2, -stitch.height, stitch.width, stitch.height);
        c.rotate(-stitch.dir*stitch.angle);
        c.translate(-xOffset, -yOffset);
    }


    function restoreCanvasToStitch(stitch) {
    //draws everything back including stitch in its new position

        c.translate(-cX, -cY);
        c.clearRect(0, 0, $("canvas")[0].width, $("canvas")[0].height);
        cX = $("canvas").attr("width")/2;
        cY = $("canvas").attr("height")/2;
        c.translate(cX, cY);
        for (var i=0; i < stitch.x; i++) {
            for (var j=0; j < rows[i]['stitches']; j++) {
                addToCanvas(getStitchY(i, j));
            }

        }
        j = 0;
        while (j <= stitch.y) {
            addToCanvas(getStitchY(i, j));
            j++;
        }

        console.log("restored to stitch " + i+" "+j);

    }



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