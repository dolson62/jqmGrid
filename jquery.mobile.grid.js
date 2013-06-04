/////////////////////////////////////////////////////

function colOfName(cols,N)

{
for(var i=0;i<cols.length;i++)
  { if(cols[i].name==N) return(cols[i]) }
return(null);
}

function gridColClick(Grid,cols,colID)

{
var col=colOfName(cols,colID);
var sortedCol=Grid.data("sortedCol");
if(!sortedCol)
   col.ascend=false;
else if(sortedCol.index!=col.index)
   col.ascend=false;

col.ascend=(!col.ascend);

gridColSort(Grid,col);
}

function gridColSort(Grid,col)

{
var gridData=Grid.data("gridData");
if(gridData.length<2) return;

var ascend=col.ascend;
Grid.data("sortedCol",col);

var sortType=0; // string
if(col.hasOwnProperty("dataType"))
  {
  var DT=col.dataType;
  if(DT=="integer")
    sortType=1; // int
  else if(DT=="float")
    sortType=2; // float
  }

var sortFunc;
if(ascend)
  {
  switch(sortType)
    {
    case 1:
      sortFunc=function(d1,d2)
               {
               d1=parseInt(d1);if(isNaN(d1)){d1=0};
               d2=parseInt(d2);if(isNaN(d2)){d2=0};
               return(d1>d2)
               };
      break;
    case 2:
      sortFunc=function(d1,d2)
               {
               d1=parseFloat(d1);if(isNaN(d1)){d1=0};
               d2=parseFloat(d2);if(isNaN(d2)){d2=0};
               return(d1>d2)
               };
      break;
    default:
      sortFunc=function(d1,d2){return(d1>d2)};
    }
  }
else
  {
  switch(sortType)
    {
    case 1:
      sortFunc=function(d1,d2)
               {
               d1=parseInt(d1);if(isNaN(d1)){d1=0};
               d2=parseInt(d2);if(isNaN(d2)){d2=0};
               return(d1<d2)
               };
      break;
    case 2:
      sortFunc=function(d1,d2)
               {
               d1=parseFloat(d1);if(isNaN(d1)){d1=0};
               d2=parseFloat(d2);if(isNaN(d2)){d2=0};
               return(d1<d2)
               };
      break;
    default:
      sortFunc=function(d1,d2){return(d1<d2)};
    }
  }

var gridRowOrder=[];
for(var ro=0;ro<gridData.length;ro++)
  { gridRowOrder[ro]=ro; }

var r1,r2,ri1,ri2,rd1,rd2,swap;

for(r1=0;r1<(gridData.length-1);r1++)
  {
  for(r2=r1+1;r2<gridData.length;r2++)
    {
    ri1=gridRowOrder[r1];
    ri2=gridRowOrder[r2];

    rd1=(gridData[ri1][col.name]);
    if(typeof rd1==="object")
      rd1=rd1.value;
    rd2=(gridData[ri2][col.name]);
    if(typeof rd2==="object")
      rd2=rd2.value;

    if(sortFunc(rd1,rd2))
      {
      swap=gridRowOrder[r1];
      gridRowOrder[r1]=gridRowOrder[r2];
      gridRowOrder[r2]=swap;
      }
    }
  }

installData(Grid,gridData,gridRowOrder);
}


function installData(Grid,gridData,gridRowOrder)

{
var cols=Grid.data("cols");
var settings=Grid.data("settings");
var sortedCol=Grid.data("sortedCol");

var dataRows=Grid.find("tbody");
dataRows.find("tr").remove();

Grid.data("gridData",gridData);


var col,cellStyle,cellData,cellDef,cellClass,format;
var rowTheme=settings.dataRowTheme;
var rowData;
var dataHTML="";

for(var ri,r=0;r<gridData.length;r++)
  {
  var rowHTML='<tr class="ui-body-'+rowTheme+'">';

  ri=gridRowOrder[r];
  rowData=gridData[ri];
  if(typeof rowData!=="object")
     rowData=new Object;

  for(var c=0;c<cols.length;c++)
    {
    col=cols[c];
    cellStyle=col.style;
    cellData="&nbsp;";
    cellClass="ui-jqmGrid-horz ui-jqmGrid-vert ";

    if(col.hidden)
      cellStyle+="display:none;";

    if(col.align!="")
      cellStyle+="text-align:"+col.align+";";

    if(rowData.hasOwnProperty(col.name))
      {
      cellDef=rowData[col.name];
      if(typeof cellDef!=="object")
        {
        cellData=cellDef;
        cellDef=((new Object).value=cellData);
        rowData[col.name]=cellDef;
        }
      else if(cellDef.hasOwnProperty("value"))
        cellData=cellDef.value;
      else
        {
        cellData="";
        cellDef.value="";
        }

      if(cellDef.hasOwnProperty("format"))
        format=cellDef.format;
      else
        format=col.format;

      if(format)
        cellData=format(cellData);

      if(cellDef.hasOwnProperty("class"))
        cellClass+=cellDef.class+" ";
      if(cellDef.hasOwnProperty("style"))
        cellStyle+=cellDef.style;
      }

    rowHTML+='<td'+(cellStyle==""?"":' style="'+cellStyle+'"')+(cellClass==""?"":' class="'+cellClass+'"')+'>'+cellData+'</td>';
    }

  dataHTML += rowHTML+'</tr>';
  }
dataRows.html(dataHTML);

dataRows=Grid.find("tbody tr");
var BHv="ui-btn-hover-"+settings.dataRowHoverTheme;
var BUp="ui-body-"+settings.dataRowTheme;
dataRows.hover(function(){$(this).addClass(BHv).removeClass(BUp);},
               function(){$(this).removeClass(BHv).addClass(BUp);});


/*

var dataRows=Grid.find("tr.datarow");
dataRows.remove();

Grid.data("gridData",gridData);

var footerRow=Grid.find("#footerrow");

var col,cellStyle,cellData,cellDef,cellClass,format;
var rowTheme=settings.dataRowTheme;
var rowData;

for(var ri,r=0;r<gridData.length;r++)
  {
  var leftmostCellClass="ui-jqmGrid-left ";
  var rowHTML='<tr class="datarow ui-body-'+rowTheme+'">';

  ri=gridRowOrder[r];
  rowData=gridData[ri];
  if(typeof rowData!=="object")
     rowData=new Object;

  for(var c=0;c<cols.length;c++)
    {
    col=cols[c];
    cellStyle=col.style;
    cellData="&nbsp;";
    cellClass=leftmostCellClass+"ui-jqmGrid-horz ui-jqmGrid-vert ";

    if(col.hidden)
      cellStyle+="display:none;";
    else
      leftmostCellClass="";

    if(col.align!="")
      cellStyle+="text-align:"+col.align+";";

    if(rowData.hasOwnProperty(col.name))
      {
      cellDef=rowData[col.name];
      if(typeof cellDef!=="object")
        {
        cellData=cellDef;
        cellDef=((new Object).value=cellData);
        rowData[col.name]=cellDef;
        }
      else if(cellDef.hasOwnProperty("value"))
        cellData=cellDef.value;
      else
        {
        cellData="";
        cellDef.value="";
        }

      if(cellDef.hasOwnProperty("format"))
        format=cellDef.format;
      else
        format=col.format;

      if(format)
        cellData=format(cellData);

      if(cellDef.hasOwnProperty("class"))
        cellClass+=cellDef.class+" ";
      if(cellDef.hasOwnProperty("style"))
        cellStyle+=cellDef.style;
      }

    rowHTML+='<td'+(cellStyle==""?"":' style="'+cellStyle+'"')+(cellClass==""?"":' class="'+cellClass+'"')+'>'+cellData+'</td>';
    }

  $(rowHTML+'</tr>').insertBefore(footerRow);
  }

var BHv="ui-btn-hover-"+settings.dataRowHoverTheme;
var BUp="ui-body-"+settings.dataRowTheme;
var DataRows=Grid.find(".datarow");
DataRows.hover(function(){$(this).addClass(BHv).removeClass(BUp);},
               function(){$(this).removeClass(BHv).addClass(BUp);});


*/

}

////////////////////////////////////////////////////////////////////////////////////////

(function($)

{
var methods=
  {
  init: function(options)
    {
    var settings = $.extend(
          {
          'headerTheme'       : 'b',
          'dataRowTheme'      : 'd',
          'dataRowHoverTheme' : 'e',
          'columns'           : []
          }, options);

    return this.each(function()
        {
        var Grid=$(this);
        var BaseID=this.id+"-";
        var scrollBarWidth=20;  // width on latest ver of chrome - need to find a way to calc this value for each browser

        var BC="ui-btn-up-"+settings.headerTheme;

        var cols=settings.columns;

        var col,colLabel,colHdrStyle,colBodyStyle,colClass,colWidth,colHidden;
        var ULC="ui-jqmGrid-ul ";

        var gridHdrColsHTML="";
        var bodyHdrColsHTML="";

        for(var i=0;i<cols.length;i++)
          {
          col=cols[i];
          col.index=i;
          col.ascend=false;
          colHdrStyle="";
          colBodyStyle="";

          if(!col.hasOwnProperty('label'))
            col.label="";
          colLabel=col.label;

          ////////

          if(!col.hasOwnProperty('format'))
            col.format=null;

          ////////

          if(!col.hasOwnProperty('class'))
            col.class="";

          ////////

          if(!col.hasOwnProperty('hdrStyle'))
            col.hdrStyle="";

          ////////

          if(!col.hasOwnProperty('style'))
            col.style="";

          ////////

          if(col.hasOwnProperty('width'))
            colWidth=col.width;
          else
            colWidth=0;

          if(colWidth!=0)
            {
            if((colWidth>0)&&(colWidth<1))
               var colWidth=(colWidth*100)+"%;";
            else
               var colWidth=colWidth+"px;";
            colHdrStyle+="width:"+colWidth+col.hdrStyle;
            colBodyStyle+="width:"+colWidth;
            }

          ////////

          if(!col.hasOwnProperty('name'))
             col.name="col"+(i+1);

          if(!col.hasOwnProperty('align'))
             col.align="";

          if(col.hasOwnProperty('hidden'))
            { colHidden=col.hidden; }
          else
            {
            colHidden=false;
            col['hidden']=false;
            }

          colClass=(col.class!=""?col.class+" ":"");
          if(colHidden)
            {
            colHdrStyle +="display:none;";
            colBodyStyle+="display:none;";
            }
          else
            {
            colClass+=ULC;
            ULC="";
            }
          ////////

          colClass+="ui-btn-up-"+settings.headerTheme+" ui-jqmGrid-col-header";
          gridHdrColsHTML += '<th id="'+col.name+'"'+(colHdrStyle==""?"":' style="'+colHdrStyle+'"')+' class="hdr-col-cell '+colClass+'">'+colLabel+'</th>';
          bodyHdrColsHTML += '<th id="'+col.name+'"'+(colBodyStyle==""?"":' style="'+colBodyStyle+'"')+' class="body-col-cell ui-jqmGrid-body-col-cell ui-jqmGrid-table-background"></th>';
          /*

          ui-jqmGrid-table-background should be added to the <th> of the "bodyHeader" when the grid is empty (no rows)
                and removed when there is a lease 1 row.

          */


          }




        var
          gridHTML =  '<div id="'+BaseID+'div-table-wrapper" class="ui-jqmGrid-div-table-wrapper">';

          gridHTML +=   '<div id="'+BaseID+'div-table-header" class="ui-jqmGrid-div-table-header">';
          gridHTML +=     '<table id="'+BaseID+'table-header" class="ui-jqmGrid-table-header">';
          gridHTML +=       '<thead>';
          gridHTML +=         '<tr class="'+BC+'">';
          gridHTML +=            gridHdrColsHTML+'<th id="scrollbar" style="width:'+scrollBarWidth+'px;padding-left:0px;;padding-right:0px;" class="ui-jqmGrid-ur ui-jqmGrid-col-header"></th>';
          gridHTML +=         '</tr>';
          gridHTML +=       '</thead>';
          gridHTML +=     '</table>';
          gridHTML +=   '</div>';

          gridHTML +=   '<div id="'+BaseID+'div-table-body" class="ui-jqmGrid-div-table-body ui-jqmGrid-table-background">';
          gridHTML +=     '<table id="'+this.id+'" class="ui-jqmGrid-table">';
          gridHTML +=       '<thead>';
          gridHTML +=         '<tr>';
          gridHTML +=            bodyHdrColsHTML;
          gridHTML +=         '</tr>';
          gridHTML +=       '</thead>';
          gridHTML +=       '<tbody>';

/*
      gridHTML +=
      '<tr><td style="display:none;">ri-000</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">ti-000</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">tn-000</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">yl-000</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">cs-000</td><td class="ui-jqmGrid-horz">mr-000</td><td class="ui-jqmGrid-scroll-data-space"></td></tr>'+
      '<tr><td style="display:none;">ri-001</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">ti-001</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">tn-001</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">yl-001</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">cs-001</td><td class="ui-jqmGrid-horz">mr-001</td></tr>'+
      '<tr><td style="display:none;">ri-002</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">ti-002</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">tn-002</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">yl-002</td><td class="ui-jqmGrid-horz ui-jqmGrid-vert">cs-002</td><td class="ui-jqmGrid-horz">mr-002</td></tr>';

*/

          gridHTML +=       '</tbody>';
          gridHTML +=     '</table>';
          gridHTML +=   '</div>';

          gridHTML +=   '<div id="'+BaseID+'div-table-footer" class="ui-jqmGrid-div-table-footer ui-btn-up-b ui-jqmGrid-ll ui-jqmGrid-lr">';
          gridHTML +=   '</div>';

          gridHTML += '</div><div style="clear:both;">';

        Grid.replaceWith(gridHTML);

        Grid=$("#"+this.id);
        Grid.data("cols",cols);
        Grid.data("settings",settings);

        var FullGrid=$("#"+BaseID+"div-table-wrapper");

        var colRowCells=FullGrid.find(".hdr-col-cell");
        var BHv="ui-btn-hover-"+settings.headerTheme;
        var BUp="ui-btn-up-"+settings.headerTheme;
        var BDn="ui-btn-down-"+settings.headerTheme;

        colRowCells.on("click",function(){ gridColClick(Grid, cols, $(this).attr("id"));});

        colRowCells.hover(function(){$(this).addClass(BHv).removeClass(BUp);},
                          function(){$(this).removeClass(BHv).addClass(BUp);});

        colRowCells.mousedown(function(){$(this).addClass(BDn).removeClass(BUp);});
        colRowCells.mouseup  (function(){$(this).removeClass(BDn).addClass(BUp);});

////////////////////////////////

/*
        Grid.addClass("ui-jqmGrid-table");

        var BC="ui-btn-up-"+settings.headerTheme;

        var cols=settings.columns;
        Grid.data("cols",cols);
        Grid.data("settings",settings);

        var col,colLabel,colStyle,colClass,colWidth,colHidden;
        var FC=0;

        var H='<thead><tr id="colrow" class="'+BC+'">';

        var ULC="ui-jqmGrid-ul ";

        for(var i=0;i<cols.length;i++)
          {
          col=cols[i];
          col.index=i;
          col.ascend=false;
          colStyle="";

          if(!col.hasOwnProperty('label'))
            col.label="";
          colLabel=col.label;

          ////////

          if(!col.hasOwnProperty('format'))
            col.format=null;

          ////////

          if(!col.hasOwnProperty('class'))
            col.class="";

          ////////

          if(!col.hasOwnProperty('hdrStyle'))
            col.hdrStyle="";

          ////////

          if(!col.hasOwnProperty('style'))
            col.style="";

          ////////

          if(col.hasOwnProperty('width'))
            colWidth=col.width;
          else
            colWidth=0;

          if(colWidth!=0)
            {
            if((colWidth>0)&&(colWidth<1))
               var w=(colWidth*100)+"%";
            else
               var w=colWidth+"px";
            colStyle+="width:"+w+";"+col.hdrStyle
            }

          ////////

          if(!col.hasOwnProperty('name'))
             col.name="col"+(i+1);

          if(!col.hasOwnProperty('align'))
             col.align="";

          if(col.hasOwnProperty('hidden'))
            { colHidden=col.hidden; }
          else
            {
            colHidden=false;
            col['hidden']=false;
            }

          colClass=col.class+" ";
          if(colHidden)
            {
            colStyle+="display:none;";
            }
          else
            {
            FC++;
            if (i==(cols.length-1))
              colClass+="ui-jqmGrid-ur ";
            else
              {
              colClass+=ULC;
              ULC="";
              }
            }
          ////////

          colClass+="ui-btn-up-"+settings.headerTheme+" ui-jqmGrid-col-header";
          H += '<th id="'+col.name+'"'+(colStyle==""?"":' style="'+colStyle+'"')+(colClass==""?"":' class="'+colClass+'"')+'>'+colLabel+'</th>';
          }
        H += '</tr></thead>';

        H += '<tbody><tr id="footerrow" class="'+BC+'"><td colspan='+FC+' class="ui-jqmGrid-ll ui-jqmGrid-lr"></td></tr></tbody>';


        Grid.html(H);

        var colRowCells=Grid.find(".ui-jqmGrid-col-header");
        var BHv="ui-btn-hover-"+settings.headerTheme;
        var BUp="ui-btn-up-"+settings.headerTheme;
        var BDn="ui-btn-down-"+settings.headerTheme;

        colRowCells.on("click",function(){ gridColClick(Grid, cols,$(this).attr("id"));});

        colRowCells.hover(function(){$(this).addClass(BHv).removeClass(BUp);},
                          function(){$(this).removeClass(BHv).addClass(BUp);});

        colRowCells.mousedown(function(){$(this).addClass(BDn).removeClass(BUp);});
        colRowCells.mouseup  (function(){$(this).removeClass(BDn).addClass(BUp);});

*/

        });

    },
  columnLabel: function(colID,newLabel)
    {
    return this.each(function()
      {
        var Grid=$(this);
        var cols=Grid.data("cols");
        var col=colOfName(cols,colID);
        if(col)
          {
          col.label=newLabel;
          var th=Grid.find("#colrow #"+col.name);
          th.html(newLabel);
          }
      });
    },
  setData: function(gridData)
    {
    if((typeof gridData==="undefined")||(!(gridData instanceof Array))) return;

    return this.each(function()
      {
      var Grid=$(this);
      var sortedCol=Grid.data("sortedCol");
      //if((typeof sortedCol==="undefined")||(!sortedCol))
      if(!sortedCol)
        {
        Grid.data("sortedCol",null);
        var gridRowOrder=[];
        for(var ro=0;ro<gridData.length;ro++)
          { gridRowOrder[ro]=ro; }
        installData(Grid,gridData,gridRowOrder);
        }
      else
        {
        Grid.data("gridData",gridData);
        gridColSort(Grid,sortedCol)
        }
      });
    }
  };

  $.fn.jqmGrid=
    function(method)
    {
    if(methods[method])
      {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    else if(typeof method==='object' || !method)
      {
      return methods.init.apply(this, arguments);
      }
    else
      {
      $.error('Method '+method+' does not exist on jQuery.jqmGrid');
      }
    };

})(jQuery);

///////////////////////////////////

function extractSettings(Grid,columnRow)

{
var Settings=new Object;
Settings.columns=[];

columnRow.each(function(index,th)
  {
  var column=new Object;
  /////////
  column.index=index;
  /////////
  column.name =th.id;
  /////////
  column.label=th.innerHTML;
  /////////
  var hidden=$(th).attr("data-hidden");
  if(typeof hidden==="undefined")
    hidden=false
  else if (typeof hidden==="string")
    hidden=(hidden.toLowerCase()==="true");
  column.hidden=hidden;
  /////////
  var width=$(th).attr("width");
  var isPercent=false;
  if(typeof width==="undefined")
    width=0;
  else
    {
    isPercent=width.indexOf("%")>0;
    width=parseFloat(width);
    if(isNaN(width))
       width=0
    else if(isPercent)
       width/=100
    }
  column.width=width;
  /////////
  var align=$(th).attr("align");
  if(typeof align!=="undefined")
    column.align=align;
  /////////
  var format=$(th).attr("data-format");
  if(typeof format==="string")
    {
    try
      { column.format=eval("("+format+");"); }
    catch(e)
      { column.format=function(){return "err";};}
    }

  /////////

  Settings.columns[index]=column;
  });

return(Settings);
}


function enhanceGrids()

{
$("table:jqmData(role='grid')").each(function()
  {
  var Grid=$(this);
  var columnRow=Grid.find("thead th");
  if(columnRow.length==0)
    columnRow=Grid.find("tr:jqmData(role='gridcolumns') th");
  if(columnRow.length==0)
    columnRow=Grid.find("tr:jqmData(role='gridcolumns') td");
  if(columnRow.length==0)
    columnRow=Grid.find("tr th");

  if(columnRow.length!=0)
    {
    var Settings=extractSettings(Grid,columnRow);
    Grid.jqmGrid(Settings);
    }
  });
}

$(document).on("pageinit",function()
{
enhanceGrids();
});


