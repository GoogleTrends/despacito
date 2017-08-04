var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var mobile = false;
var fullWidth = false;
var miniMobile = false;
if(viewportWidth < 800){
  fullWidth = true;
}

if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  mobile = true;
}

if (viewportWidth < 1025){
  mobile=true;
}


console.log("Height: "+viewportHeight);
console.log("Width: "+viewportWidth);

d3.csv('topvids_ltd.csv', loadCsv, function(error, data) {
    loadViz(data)
});


function loadViz(data){

 // Reorganize data by song
 data = nestDataAsSongs(data);

 data=data.sort(compareRank)

 var vidId,
     songSelected,
     sideBarVid,
     lineName,
     url,
     maxViews,
     tooltipOffestLeft,
     tooltipOffestTop;

console.log(data);
 var dataMap = d3.map(data,function(d){
   return d.key;
 });

// Setting up containers for tooltip, sections + misc DOM structure


  var containerAll = d3.select("body")
      .append("div")
      .attr('class', 'container-all');

  var chartTitleContainer = containerAll
      .append("div")
      .attr('class', 'chart-title-container');

  var chartTitleText = chartTitleContainer
      .append("div")
      .attr('class', 'chart-title-text')
      .text("YouTube's Most Viewed Music Videos")

  var chartTitleYTLogo = chartTitleContainer
      .append("img")
      .attr('src', 'ytlogo.png')
      .attr('class', 'title-image')

  var svgContainer = containerAll
      .append("div")
      .attr('class', 'svg-container')

  var svg = svgContainer
      .append("svg")
      .attr('class', 'svg-chart');

  var svgHeight = 500,
      svgWidth  = 1100;


  var margin = {top: 30, right: 30, bottom: 30, left: 30};

  if(mobile){
    svgHeight=viewportHeight/1.7;
    svgWidth=viewportWidth/1.1;
  }

      svg.attr("width", svgWidth)
         .attr("height", svgHeight);


  var width = svg.attr("width") - margin.left - margin.right,
     height = svg.attr("height") - margin.top - margin.bottom,
     g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");



 var tooltipContainer = d3.select("div.svg-container")
     .append("div")
     .style('display', 'none')
     .attr('class', 'tooltip-container')

 var tooltipImageBox = tooltipContainer
     .append("div")
     .attr('class', 'tooltip-image-box')

 var tooltipTextContainer = tooltipContainer
     .append("div")
     .attr('class', 'tooltip-text-container')

 var tooltipTextContainerInner = tooltipTextContainer
     .append("div")
     .attr('class', 'tooltip-text-container-inner')

 var tooltipTitleBox = tooltipTextContainerInner
     .append("p")
     .attr('class', 'tooltip-title-text-box annotation')

 var tooltipViewsBox = tooltipTextContainerInner
     .append("p")
     .attr('class', 'tooltip-views-text-box annotation')

 var tooltipDateBox = tooltipTextContainerInner
     .append("p")
     .attr('class', 'tooltip-release-text-box annotation')



// Songs section container
  var listContainer = containerAll
      .append("div")
      .attr('class', 'list-container');

  // var titleBottom = mobile ? "TOP 20" : "Top 20 Videos"
  //
  // var listSectionTitle = listContainer
  //     .append("div")
  //     .attr('class', 'list-section-title')
  //     .text(titleBottom);

  var songNameContainer= listContainer
      .append("div")
      .attr('class', 'songs-name-container');

var songNames;


// Setting up key objects
  var vidDateByID={}

     data.forEach(function(d){vidDateByID[d.values[0].external_video_id]=d.values[0].date_id.toString().substr(0,15);})

  var vidNameByID={}

     data.forEach(function(d){vidNameByID[d.values[0].external_video_id]=d.key;})


 songNames = songNameContainer
   .selectAll("div.songs")
   .data(data)
   .enter()
   .append("div")
   .attr('class', 'song')
   .attr('id', function(d){ return "id"+d.values[0].external_video_id;})
  //  .style("margin-top", function(){return height /})
   .text(function(d,i){
     if (d.key.length>25){
     return (i+1) + ". " + d.key.slice(0,22)+"...";
     }
     else return (i+1) + ". " + d.key;
   })
   .on("mouseover", function(d){

     var tempKey = (function(){return d;})();
     console.log(tempKey);

     maxViews = (function(){return numberWithCommas(d.values[d.values.length-1].cumulative_views);})();
    //  console.log(maxViews);

     hoveredLine.attr("d",function(){
       return line(tempKey.values)
     });

     d3.select(this)//.style("font-weight","bold")
        .style("border-bottom","0.5px solid black");

     vidId = this.id.slice(2,13);


    // Tooltip Text
    tooltipTitleBox.text(vidNameByID[vidId]);
    tooltipViewsBox.text(maxViews +" views");
    tooltipDateBox.text("Released: "+vidDateByID[vidId])

    // Tooltip Image


      tooltipImageBox
        .append("img")
        .attr('class', 'tooltip-image')
        .attr('src', function(){
          return "vidimgs/"+vidId+".png";
        })

        if(mobile){d3.select("div.tooltip-image-box").remove()};


       tooltipOffestLeft = "30px";
       tooltipOffestTop = "30px";

       if(mobile){
         if (viewportWidth<325){ tooltipOffestTop="42px" }
       }

      tooltipContainer
        .style("left",tooltipOffestLeft)
        .style("top",tooltipOffestTop)

    // Tooltip visibility
    d3.select(".tooltip-container")
    .style("display", "");

   })
   .on("mouseout", function(d){
     tooltipImageBox.select("img.tooltip-image").remove()
     tooltipTitleBox.text(null);
     tooltipViewsBox.text(null);
     tooltipDateBox.text(null)

     d3.select(".tooltip-container")
     .style("display", "none");

     d3.select(this).style("font-weight","normal").style("border-bottom", null)


   })
   .on("click", function(d){
     if(mobile){
       return
     }
     else {
       url="https://www.youtube.com/watch?v=" + this.id.slice(2,13);
       window.open(url, '');
     }
   })


 var minDate = new Date(2012, 1, 1);

 var maxDate = new Date(2017, 7, 4);

 var x = d3.scaleTime()
    .domain([minDate,maxDate])
    .range([0, width]);

 var y = d3.scaleLinear()
    .domain([0,3000000000])
    .range([height, 0]);


    // Appending grid lines
  svg.append("line")
      .attr('class', 'line-grid')
      .attr('x1', function(){ return x(minDate)+margin.left;})
      .attr('x2', function(){ return x(maxDate)+margin.left+8;})
      .attr('y1', function(){ return y(1000000000)+margin.bottom;})
      .attr('y2', function(){ return y(1000000000)+margin.bottom;})
      .style('stroke', '#000000')
    // d3.merge(data.map(function(d) { return d.values; }));

  svg.append("line")
      .attr('class', 'line-grid')
      .attr('x1', function(){ return x(minDate)+margin.left;})
      .attr('x2', function(){ return x(maxDate)+margin.left+8;})
      .attr('y1', function(){ return y(2000000000)+margin.bottom;})
      .attr('y2', function(){ return y(2000000000)+margin.bottom;})
      .style('stroke', '#000000')

  svg.append("line")
      .attr('class', 'line-grid')
      .attr('x1', function(){ return x(minDate)+margin.left;})
      .attr('x2', function(){ return x(maxDate)+margin.left;})
      .attr('y1', function(){ return y(3000000000)+margin.top;})
      .attr('y2', function(){ return y(3000000000)+margin.top;})
      .style('stroke', '#000000')



 var voronoi = d3.voronoi()
    .x(function(d) {
      return x(d.date_id);
    })
    .y(function(d) { return y(+d.cumulative_views); })
    .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

 var line = d3.line()
     .x(function(d) {
       return x(d.date_id);
      })
     .y(function(d) { return y(+d.cumulative_views); });




var newData = d3.merge(data.map(function(d){
  return d.values;
}))

var scaledDownData = [];

for (var item in newData){
  if(item % 7 == 0){
    scaledDownData.push(newData[item])
  }
}

  g.append("g")
    .attr("class", "videos")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .attr('class', function(d){return 'video-lines '+'line'+d.values[0].external_video_id;})
    .attr("stroke", function(d){
      if (d.key==="Luis Fonsi - Despacito"){
        return "#7E7E7E";
      }
      else
      return "#EAEAEA";
      // else return "#FF0075";
    })
    .style("stroke-width",function(d){
      // if (d.key==="Luis Fonsi - Despacito ft. Daddy Yankee"){
      //   return "3";
      // }
      // else
      return "2";
    })
    // .style("pointer-events","none")
    // .style("cursor","pointer")
    .attr("d", function(d) {
      return line(d.values);
      d.line = this; return line(d.values);
    });

  var voronoiData = voronoi.polygons(scaledDownData);

  var voronoiGroup = g.append("g")
      .attr("class", "voronoi");

// Voronoi

  voronoiGroup.selectAll("path")
    .data(voronoiData)
    .enter().append("path")
    .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
    .style("pointer-events","all")
    .on("mouseover", function(d){


      songSelected = dataMap.get(d.data.title);

      console.log(songSelected);

      hoveredLine.attr("d",function(d){
        return line(songSelected.values)
      });

      maxViews = (function(){return numberWithCommas(songSelected.values[songSelected.values.length-1].cumulative_views);})();
      vidId = (function(){return songSelected.values[0].external_video_id;})();

      // Tooltip Text
      tooltipTitleBox.text(vidNameByID[vidId]);
      tooltipViewsBox.text(maxViews +" views");
      tooltipDateBox.text("Released: "+vidDateByID[vidId])

      // Tooltip Image
      tooltipImageBox
        .append("img")
        .attr('class', 'tooltip-image')
        .attr('src', function(){
          return "vidimgs/"+vidId+".png";
        })

        if(mobile){d3.select("div.tooltip-image-box").remove()};

        tooltipOffestLeft = "30px";
        tooltipOffestTop = "30px";

        if(mobile){
          if (viewportWidth<325){ tooltipOffestTop="42px" }
        }

       tooltipContainer
         .style("left",tooltipOffestLeft)
         .style("top",tooltipOffestTop)

      // Tooltip visibility
      tooltipContainer
      .style("display", '')


          sideBarVid = "id"+vidId;


          d3.select("div#"+sideBarVid.toString())
            // .style("font-weight","bold")
            .style("border-bottom","0.5px solid black")

        // svg.select(function(){return "div#id"+vidId.toString()}).remove()
        // console.log(vidId.toString());
        // .style("font-weight","bold")
        // .style("border-bottom","0.5px solid black")

    })
    .on("mouseout", function(d){
      d3.select("div#"+sideBarVid.toString())
        .style("font-weight","normal")
        .style("border-bottom",null)

      d3.selectAll("text.line-annotation-text").remove();

      tooltipContainer
      .style("display", 'none')

      tooltipImageBox.select("img.tooltip-image").remove()
      tooltipTitleBox.text(null);
      tooltipViewsBox.text(null);
      tooltipDateBox.text(null)

    })
    .on("click", function(d){
      if(mobile){
        return
      }
      else{
       vidLink=songSelected.values[0].external_video_id;
       url="https://www.youtube.com/watch?v=" + vidLink;
       window.open(url, '');
       }
    });

  var hoveredLine = g.append("g").append("path")
    .attr("class","selected-song")
    .style("stroke","#cc181e")
    .style("stroke-width","2px")
    .on("click", function(d){
      if(mobile){
        return
      }
      else{
       vidLink=songSelected.values[0].external_video_id;
       url="https://www.youtube.com/watch?v=" + vidLink;

      window.open(url, '');
      }
    })



var tickNumX = (function(){if (mobile){return 2} else return 5})()

svg.append("g")
      .attr("transform", "translate("+margin.left+"," + (height+margin.bottom) + ")")
      .attr('class', 'axis-x')
      .call(d3.axisBottom(x).ticks(tickNumX));

svg.append("g")
      .attr('class', 'axis-y')
      .attr("transform", "translate("+(width+margin.left)+"," + (margin.bottom) + ")")
      // .attr("transform", "translate(0,"+ (margin.bottom) + ")")
      .call(d3.axisRight(y).ticks(0));

var numPadding = 6;

var oneBilLabel = svg
    .append("text")
    .attr('class', 'bil-label')
    .attr('x', function(){ return x(maxDate)+margin.left+numPadding;})
    .attr('y', function(){ return y(970000000)+margin.bottom;})
    .text("1B")

var twoBilLabel = svg
    .append("text")
    .attr('class', 'bil-label')
    .attr('x', function(){ return x(maxDate)+margin.left+numPadding;})
    .attr('y', function(){ return y(1970000000)+margin.bottom;})
    .text("2B")


var threeBilPlacement = -80;

if(mobile){threeBilPlacement = -40}



svg
  .append("text")
  .attr('class', 'bil-label-record')
  .attr('x', function(){ return x(maxDate)+threeBilPlacement;})
  .attr('y', function(){ return y(2960000000)+margin.bottom;})
  .text("3 billion views")
  .style("stroke", "#FFFFFF")
  .style("stroke-width", "8px")
  .style('fill', '')

var threeBilLabel = svg
  .append("text")
  .attr('class', 'bil-label-record')
  .attr('x', function(){ return x(maxDate)+threeBilPlacement;})
  .attr('y', function(){ return y(2960000000)+margin.bottom;})
  .text("3 billion views")
  // .style("stroke", "#EF2119")
  .style('fill', '#EF2119')
  // .style("stroke-width", 1)




}

function loadCsv(d){

  var year = +d.date_id.substring(0,4);

  if(year===1970){
    return
  }

if(d.title==="PSY - GANGNAM STYLE"){
  d.title = "Psy - Gangnam Style";
}

if(d.title==="Major Lazer & DJ Snake - Lean On"){
  d.title = "Major Lazer - Lean On";
}

  var month= d.date_id.substring(4,6);
  var day  = d.date_id.substring(6,8);
  var date = new Date(year, month-1, day);

  d.date_id = date;

  return d;
}

function nestDataAsSongs(data) {
  var entries = d3.nest()
      .key(function(d) { return d.title; })
      .entries(data);

  return entries;
}


function compareRank(a,b) {
  if (+a.values[a.values.length-1].cumulative_views < +b.values[b.values.length-1].cumulative_views)
    return 1;
  if (+a.values[a.values.length-1].cumulative_views > +b.values[b.values.length-1].cumulative_views)
    return -1;
  return 0;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
