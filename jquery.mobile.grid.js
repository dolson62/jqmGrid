/////////////////////////////////////////////////////

function dataColumnOfName(dataColumns,N) {

  for(var i=0;i<dataColumns.length;i++) {
    if(dataColumns[i].name==N) return(dataColumns[i]);
  }  

  return(null);
}

function gridColClick(Grid,dataColumns,colID) {

  var dataColumn=dataColumnOfName(dataColumns,colID);
  var sortedCol=Grid.data("sortedCol");
  if(!sortedCol) {
    dataColumn.ascend=false;
  } else if(sortedCol.index!=dataColumn.index) {
    dataColumn.ascend=false;
  }  

  dataColumn.ascend=(!dataColumn.ascend);

  var dataPump=Grid.data("dataPump");
  dataPump.sortColumn(Grid,dataColumn);
  gridSiphonData(Grid);
}

function gridLoadingMessage(Grid,method) {

  var msg=$("#"+Grid.attr("id")+"-div-loading-msg");
  if(method=="show") {
    msg.show()
  } else {
    msg.hide();
  }  
}

function gridFull(Grid) {
  return($(Grid.data("fullID")));
}

function gridHeader(Grid) {
  return($(Grid.data("headerID")));
}

function gridHeaderCell(Grid,colID) {
  var dataColumns=Grid.data("dataColumns");
  var dataColumn=dataColumnOfName(dataColumns,colID);
  if(dataColumn) {
    return(gridHeader(Grid).find("th#"+dataColumn.name))
  } else {
    return($());
  }
}

function gridShowHideColumn(Grid,colID,hide) {
  var fg=gridFull(Grid);
  var dataColumns=Grid.data("dataColumns");
  var dataColumn=dataColumnOfName(dataColumns,colID);
  if(dataColumn) {
    var cells=fg.find("td#"+dataColumn.name+", th#"+dataColumn.name);
    if(hide) {
      dataColumn.hidden=true;
      cells.hide();
      dataColumns.visibleColumnCount--;
    } else {
      dataColumn.hidden=false;
      cells.show();
      dataColumns.visibleColumnCount++;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////

function gridDataRowMetrics(Grid)

{
var metrics=Grid.data("dataRowMetrics");
if(!metrics)
  {
  metrics = new Object;
  var cellMeasureRowHeight=Grid.find("tbody tr");
  if(cellMeasureRowHeight.length>0)
    {
    metrics.rowHeight = cellMeasureRowHeight.height();
    var divGridBody=$("#"+Grid.attr('id')+"-div-table-wrapper").find(".ui-jqmGrid-div-table-body");
    metrics.rowsVisible = Math.floor(divGridBody.outerHeight()/metrics.rowHeight)+1;
    Grid.data("dataRowMetrics",metrics);

    var measureRow=Grid.find("tbody tr.cellMeasure");
    measureRow.remove();
    }
  else
    metrics.rowHeight = -1;
  }
return(metrics);
}

function gridEmptyDataRows(Grid)

{
Grid.find("tbody").empty();
}

function gridResetDataSet(Grid)

{
gridEmptyDataRows(Grid);
Grid.data("dataPump").resetDataSet(Grid);
Grid.data("nextRowID",0);
}

function gridScrolled(divGridBody,scrollHeight,scrollTop)

{
var Grid=divGridBody.find(".ui-jqmGrid-table");
var gridMetrics=gridDataRowMetrics(Grid);

if(gridMetrics.rowHeight==-1) return;

var dataPump=Grid.data("dataPump");
if(!dataPump.haveMoreData()) return;

var topVisibleRow=Math.floor(scrollTop/gridMetrics.rowHeight);
var lastVisibleRow=topVisibleRow+gridMetrics.rowsVisible;
if(lastVisibleRow>=dataPump.highestRowIndex())
  {
  dataPump.nextPage(Grid,lastVisibleRow,gridMetrics);
  }
}

function gridDoError(Grid,msg)

{
var dataColumns=Grid.data("dataColumns");
var settings=Grid.data("settings");
var dataRows=Grid.find("tbody");
var errorHTML='<tr class="ui-body-'+settings.dataRowErrorTheme+'"><td class="ui-jqmGrid-td-error-cell" colspan='+dataColumns.visibleColumnCount+'>Error: '+msg+'</td></tr>';
dataRows.append(errorHTML);
}

function gridSiphonData(Grid)

{
var dataColumns=Grid.data("dataColumns");
var settings=Grid.data("settings");
var sortedCol=Grid.data("sortedCol");
var dataPump=Grid.data("dataPump");
var rowID=Grid.data("nextRowID");

var dataRows=Grid.find("tbody");

var dataColumn,cellStyle,cellData,cellDef,cellClass,format;
var rowTheme=settings.dataRowTheme;
var rowData;
var dataHTML="";
var gridMetrics=gridDataRowMetrics(Grid);


while(rowData=dataPump.nextRow())
  {
  var rowClass="",rowStyle="";
  if(rowData.hasOwnProperty("row"))
    {
    cellDef=rowData["row"];
    if(typeof cellDef==="object")
      {
      if(cellDef.hasOwnProperty("style"))
        rowStyle+=cellDef.style;
      if(cellDef.hasOwnProperty("class"))
        rowClass+=(" "+cellDef.class);
      }
    }

  var rowHTML='<tr id="row'+(rowID++)+'" class="'+(rowClass==""?'ui-body-'+rowTheme:rowClass)+'"'+(rowStyle==""?'':' style="'+rowStyle+'"')+'>';

  if(typeof rowData!=="object")
     rowData=new Object;

  for(var c=0;c<dataColumns.length;c++)
    {
    dataColumn=dataColumns[c];
    cellStyle=dataColumn.style;
    cellData="&nbsp;";
    cellClass="ui-jqmGrid-horz ui-jqmGrid-vert ";

    if(dataColumn.hidden)
      cellStyle+="display:none;";

    if(dataColumn.align!="")
      cellStyle+="text-align:"+dataColumn.align+";";

    if(dataColumn.widthText!="")
      cellStyle+="max-width:"+dataColumn.widthText;

    if(rowData.hasOwnProperty(dataColumn.name))
      {
      cellDef=rowData[dataColumn.name];
      if(typeof cellDef!=="object")
        {
        cellData=cellDef;
        cellDef=((new Object).value=cellData);
        rowData[dataColumn.name]=cellDef;
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
        format=dataColumn.format;

      if(format)
        cellData=format(cellData);

      if(cellDef.hasOwnProperty("class"))
        cellClass+=cellDef.class+" ";
      if(cellDef.hasOwnProperty("style"))
        cellStyle+=cellDef.style;
      }

    rowHTML+='<td id="'+dataColumn.name+'"'+(cellStyle==""?"":' style="'+cellStyle+'"')+(cellClass==""?"":' class="'+cellClass+'"')+'>'+cellData+'</td>';
    }

  dataHTML += rowHTML+'</tr>';
  }
dataRows.append(dataHTML);
Grid.data("nextRowID",rowID);
}

////////////////////////////////////////////////////////////////////////////////////////

function LocalDataSetDataPump(localData)

{
this.totalRows      =LocalDataSetDataPump_getTotalRows;
this.highestRowIndex=LocalDataSetDataPump_getHighestRowIndex;
this.resetDataSet   =LocalDataSetDataPump_resetDataSet;
this.sortColumn     =LocalDataSetDataPump_sortColumn;
this.rowData        =LocalDataSetDataPump_rowData;
this.haveMoreData   =LocalDataSetDataPump_haveMoreData;
this.nextRow        =LocalDataSetDataPump_nextRow;
this.nextPage       =LocalDataSetDataPump_nextPage;
this.xlatRowID      =LocalDataSetDataPump_xlatRowID;

//internal
this.resetRowOrder=LocalDataSetDataPump_resetRowOrder;

this.gridData=localData;
}

function LocalDataSetDataPump_getTotalRows()

{
return(this.gridData.length);
}

function LocalDataSetDataPump_getHighestRowIndex()

{
return(this.rowIndex);
}

function LocalDataSetDataPump_resetRowOrder()

{
this.rowIndex=0;
this.gridRowOrder=[];
for(var ro=0;ro<this.gridData.length;ro++)
  {
  this.gridRowOrder[ro]=ro;
  }
}

function LocalDataSetDataPump_rowData(rowIndex)

{
return((rowIndex<this.gridData.length)?this.gridData[this.gridRowOrder[rowIndex]]:new Object);
}

function LocalDataSetDataPump_xlatRowID(rowID)

{
return(this.gridRowOrder[rowID]);
}

function LocalDataSetDataPump_haveMoreData()

{
return(this.rowIndex<this.gridData.length);
}

function LocalDataSetDataPump_nextPage(Grid,triggerRow,metrics)

{
gridSiphonData(Grid);
}

function LocalDataSetDataPump_nextRow()

{
return(this.rowIndex<this.gridData.length?this.rowData(this.rowIndex++):null);
}

function LocalDataSetDataPump_resetDataSet(Grid)

{
var settings=Grid.data("settings");
var sortedCol=settings.initialSortedColumn;
if(sortedCol)
  {
  this.sortColumn(Grid,sortedCol);
  }
else
  {
  this.resetRowOrder();
  }

this.nextPage(Grid,0,null);
}

function LocalDataSetDataPump_sortColumn(Grid,col)

{
if(this.gridData.length<2) return;

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

gridEmptyDataRows(Grid);
this.resetRowOrder();

var r1,r2,ri1,ri2,rd1,rd2,swap;

for(r1=0;r1<(this.gridData.length-1);r1++)
  {
  for(r2=r1+1;r2<this.gridData.length;r2++)
    {
    ri1=this.gridRowOrder[r1];
    ri2=this.gridRowOrder[r2];

    rd1=(this.gridData[ri1][col.name]);
    if(typeof rd1==="object")
      rd1=rd1.value;
    rd2=(this.gridData[ri2][col.name]);
    if(typeof rd2==="object")
      rd2=rd2.value;

    if(sortFunc(rd1,rd2))
      {
      swap=this.gridRowOrder[r1];
      this.gridRowOrder[r1]=this.gridRowOrder[r2];
      this.gridRowOrder[r2]=swap;
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////

function AJAXPagedDataSetDataPump(dataPagesURL,useCORS)

{
this.totalRows      =AJAXPagedDataSetDataPump_getTotalRows;
this.highestRowIndex=AJAXPagedDataSetDataPump_getHighestRowIndex;
this.resetDataSet   =AJAXPagedDataSetDataPump_resetDataSet;
this.sortColumn     =AJAXPagedDataSetDataPump_sortColumn;
this.rowData        =AJAXPagedDataSetDataPump_rowData;
this.haveMoreData   =AJAXPagedDataSetDataPump_haveMoreData;
this.nextRow        =AJAXPagedDataSetDataPump_nextRow;
this.nextPage       =AJAXPagedDataSetDataPump_nextPage;
this.xlatRowID      =AJAXPagedDataSetDataPump_xlatRowID;

//internal
this.finishNextPage =AJAXPagedDataSetDataPump_finishNextPage;
this.delayTest      =AJAXPagedDataSetDataPump_delayTest;
this.nextPageFail   =AJAXPagedDataSetDataPump_nextPageFail;
this.setGridPaging  =AJAXPagedDataSetDataPump_setGridPaging;

var AJAXDataType="json";
if(useCORS)
  AJAXDataType+="p";
this.gridDataPagesURL=dataPagesURL;
this.gridAJAXDataType=AJAXDataType;
}

function AJAXPagedDataSetDataPump_getTotalRows()

{
return(this.rowsTotal);
}

function AJAXPagedDataSetDataPump_getHighestRowIndex()

{
return(this.rowIndex);
}

function AJAXPagedDataSetDataPump_resetDataSet(Grid)

{
var settings=Grid.data("settings");

this.paging=false;
this.totalPages=-1;
this.pageIndex=-1;
this.rowsPerPage=settings.rowsPerPage;
this.rowsTotal=0;
this.rowIndex=0;
this.nextPage(Grid,0,null);
}

function AJAXPagedDataSetDataPump_sortColumn(Grid,col)

{
Grid.data("sortedCol",col);
gridResetDataSet(Grid);
}

function AJAXPagedDataSetDataPump_xlatRowID(rowID)

{
return(rowID);
}

function AJAXPagedDataSetDataPump_rowData(rowIndex,rowPageIndex,pageIndex)

{
return(this.currentPage.rows[rowPageIndex]);
}

function AJAXPagedDataSetDataPump_haveMoreData()

{
return(this.rowIndex<this.totalRows());
}

function AJAXPagedDataSetDataPump_nextRow()

{
return(this.pageRowIndex<this.pageRows?this.rowData(this.rowIndex++,this.pageRowIndex++,this.pageIndex):null);
}

function AJAXPagedDataSetDataPump_setGridPaging(Grid,enable)

{
if(enable)
  {
  this.paging=true;
  gridLoadingMessage(Grid,"show");
  }
else
  {
  this.paging=false;
  gridLoadingMessage(Grid,"hide");
  }

return(enable);
}


function AJAXPagedDataSetDataPump_nextPage(Grid,triggerRow,metrics)

{
if(this.paging)return;

this.pageIndex++;
if((this.totalPages!=-1)&&(this.pageIndex>=this.totalPages)) return(false);

this.setGridPaging(Grid,true);

var requestOptions={
    page:          this.pageIndex,
    rowsPerPage:   this.rowsPerPage,
    sortColumn:    "",
    sortDirection: "ASC"
    };


var sortedCol=Grid.data("sortedCol");
if(sortedCol)
  {
  requestOptions.sortColumn=sortedCol.name;
  requestOptions.sortDirection=(sortedCol.ascend?"ASC":"DESC");
  }

var pump=this;
$.ajax({
  dataType:   this.gridAJAXDataType,  // "json" or "jsonp"
  url:        this.gridDataPagesURL,
  beforeSend: function(jqxhr, settings){jqxhr.requestURL=pump.gridDataPagesURL;},
  data:       requestOptions
  })
   .done(function(data){pump.finishNextPage(Grid,data);})
   .fail(function(jqxhr, textStatus, error){pump.nextPageFail(Grid, jqxhr, textStatus, error);});


//setTimeout(function(){ pump.delayTest(Grid); },3000);
//setTimeout(function(){ pump.delayTest(Grid); },30);
}

function AJAXPagedDataSetDataPump_delayTest(Grid)

{
var pump=this;
$.ajax({
  dataType:   this.gridAJAXDataType, // "json" or "jsonp"
  url:        this.gridDataPagesURL,
  beforeSend: function(jqxhr, settings){jqxhr.requestURL=pump.gridDataPagesURL;},
  data:       {
              page:        this.pageIndex,
              rowsPerPage: this.rowsPerPage
              }
  })
   .done(function(data){pump.finishNextPage(Grid,data);})
   .fail(function(jqxhr, textStatus, error){pump.nextPageFail(Grid, jqxhr, textStatus, error);});
}

function AJAXPagedDataSetDataPump_nextPageFail(Grid, jqxhr, textStatus, error)

{
gridDoError(Grid,'unable to load data from: "'+jqxhr.requestURL+'"; '+error);
this.setGridPaging(Grid,false);

//alert("fail: "+textStatus + ', ' + error);
}

function AJAXPagedDataSetDataPump_finishNextPage(Grid,pageJSON)

{
this.currentPage=pageJSON;
this.pageRows=0;
this.pageRowIndex=0;
if(this.pageIndex < this.currentPage.totalPages)
  {
  this.totalPages = this.currentPage.totalPages;
  this.rowsTotal  = this.currentPage.totalRows;
  this.pageRows   = this.currentPage.rows.length;
  }
else
  this.totalPages=0;

gridSiphonData(Grid);
this.setGridPaging(Grid,false);
}

////////////////////////////////////////////////////////////////////////////////////////

(function($)

{
var methods=
  {
  init: function(options)
    {
    var settings = $.extend({}, $.fn.jqmGrid.defaultOptions, options);

    return this.each(function()
        {
        var Grid=$(this);
        var gridID=this.id;
        var BaseID=gridID+"-";

        var scrollBarWidth=20;  // width on latest ver of chrome - need to find a way to calc this value for each browser

        var divFullStyle="";
        var divBodyStyle="";
        if(settings.height!=-1)
           divBodyStyle+="height:"+settings.height+"px;";
        if(settings.width!=-1)
           {
           //divBodyStyle+="width:"+settings.width+"px;";
           divFullStyle+="width:"+settings.width+"px;";
           }
        if(settings.minHeight!=-1)
           divBodyStyle+="min-height:"+settings.minHeight+"px;";
        if(settings.maxHeight!=-1)
           divBodyStyle+="max-height:"+settings.maxHeight+"px;";

        var BC="ui-btn-up-"+settings.headerTheme;

        var dataColumns=settings.columns;

        var r=0,c=0;
        var dataColumn,header;
        var colLabel,colHdrStyle,colBodyStyle,colClass,colWidth,colHidden;
        var ULC="ui-jqmGrid-ul ";

        var gridHdrColsHTML=[];
        var bodyHdrColsHTML=[];
        var headerRow;

        var visibleColumnCount=0;

        for(c=0;c<dataColumns.length;c++)
          {
          dataColumn=dataColumns[c];
          dataColumn.index=c;
          dataColumn.ascend=false;

          ////////

          if((dataColumn)&&(!dataColumn.hasOwnProperty('label')))
             dataColumn.label="";

          if(!dataColumn.hasOwnProperty('format'))
            dataColumn.format=null;

          ////////

          if(!dataColumn.hasOwnProperty('class'))
            dataColumn.class="";

          ////////

          if(!dataColumn.hasOwnProperty('style'))
            dataColumn.style="";

          ////////

          if(!dataColumn.hasOwnProperty('name'))
            dataColumn.name="col"+(c+1);

          if(!dataColumn.hasOwnProperty('align'))
            dataColumn.align="";

         if(dataColumn.hasOwnProperty('hidden'))
           { colHidden=dataColumn.hidden; }
         else
           {
           colHidden=false;
           dataColumn.hidden=false;
           }

          if(!colHidden)
            visibleColumnCount++;
          }

        var headerRows=settings.columnHeaders;
        if(!headerRows)
          {
          headerRows=[[]];
          for(c=0;c<dataColumns.length;c++)
             {
             header = $.extend({colSpan: 1,rowSpan:1}, dataColumns[c]);
             headerRows[0][c] = header;
             }

          settings.columnHeaders=headerRows;
          }

        var numberHeaderRows=headerRows.length;
        for(r=0;r<numberHeaderRows;r++)
          {
          gridHdrColsHTML[r]="";
          bodyHdrColsHTML[r]="";
          headerRow=headerRows[r];

          for(c=0;c<headerRow.length;c++)
            {
            header=headerRow[c];
            dataColumn=header.dataColumn;

            colHdrStyle="";
            colBodyStyle="";

            if(!header.hasOwnProperty('label'))
              header.label="";
            colLabel=header.label;

            ////////

            if(!header.hasOwnProperty('class'))
              header.class="";

            ////////

            if(!header.hasOwnProperty('style'))
              header.style="";

            ////////

            if(dataColumn)
              dataColumn.widthText="";

            if(header.hasOwnProperty('width'))
              colWidth=header.width;
            else
              colWidth=0;

            if(colWidth!=0)
              {
              if((colWidth>0)&&(colWidth<1))
                 colWidth=(colWidth*100)+"%;";
              else
                 colWidth=colWidth+"px;";

              colHdrStyle+="width:"+colWidth+header.style;
              colBodyStyle+="width:"+colWidth;
              header.widthText=colWidth;
              if(dataColumn)
                dataColumn.widthText=colWidth;
              }

            ////////

            if(header.hasOwnProperty('hidden'))
              { colHidden=header.hidden; }
            else
              {
              colHidden=false;
              header.hidden=false;
              }

            colClass=(header.class!=""?header.class+" ":"");
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
            gridHdrColsHTML[r]  += '<th id="'+header.name+'"'+(colHdrStyle ==''?'':' style="'+colHdrStyle +'"')+' class="hdr-col-cell '+colClass+'"'+(header.colSpan<2?'':' colspan='+header.colSpan)+(header.rowSpan<2?'':' rowspan='+header.rowSpan)+'>'+colLabel+'</th>';
            bodyHdrColsHTML[r]  += '<th id="'+header.name+'"'+(colBodyStyle==''?'':' style="'+colBodyStyle+'"')+' class="body-col-cell ui-jqmGrid-body-col-cell ui-jqmGrid-table-background"></th>';
            /*

            ui-jqmGrid-table-background should be added to the <th> of the "bodyHeader" when the grid is empty (no rows)
                  and removed when there is a least 1 row.

            */


            }
          }

        var
          gridHTML =  '<div id="'+BaseID+'div-table-wrapper" class="ui-jqmGrid-div-table-wrapper"'+(divFullStyle==''?'':' style="'+divFullStyle+'"')+'>';
          gridHTML +=   '<div id="'+BaseID+'div-loading-msg" class="ui-jqmGrid-div-table-loading-data-msg">';
          gridHTML +=     '<div id="'+BaseID+'div-loading-msg-inner" class="ui-jqmGrid-div-table-loading-data-msg-inner">Loading...';
          gridHTML +=     '</div>';
          gridHTML +=  '</div>';
          gridHTML +=  '<div id="'+BaseID+'div-table-header" class="ui-jqmGrid-div-table-header">';

          gridHTML +=     '<table id="'+BaseID+'table-header" class="ui-jqmGrid-table-header">';
          gridHTML +=       '<thead>';
          for(r=0;r<numberHeaderRows;r++)
            {
            gridHTML +=       '<tr class="'+BC+'">';
            gridHTML +=          gridHdrColsHTML[r]+ (r==0?'<th id="scrollbar" style="width:'+scrollBarWidth+'px;padding-left:0px;padding-right:0px;" class="ui-jqmGrid-ur ui-jqmGrid-col-header"'+(numberHeaderRows<2?'':' rowspan='+numberHeaderRows)+'></th>':'');
            gridHTML +=       '</tr>';
            }
          gridHTML +=       '</thead>';
          gridHTML +=     '</table>';
          gridHTML +=   '</div>';

          gridHTML +=   '<div id="'+BaseID+'div-table-body" class="ui-jqmGrid-div-table-body ui-jqmGrid-table-background"'+(divBodyStyle==''?'':' style="'+divBodyStyle+'"')+'>';
          gridHTML +=     '<table id="'+this.id+'" class="ui-jqmGrid-table">';
          gridHTML +=       '<thead>';
          for(r=0;r<numberHeaderRows;r++)
            {
            gridHTML +=         '<tr>';
            gridHTML +=            bodyHdrColsHTML[r];
            gridHTML +=         '</tr>';
            }
          gridHTML +=       '</thead>';
          gridHTML +=       '<tbody>';
          gridHTML +=         '<tr class="cellMeasure ui-jqmGrid-table-background"><td colspan='+visibleColumnCount+'>&nbsp;</td></tr>';
          gridHTML +=       '</tbody>';
          gridHTML +=     '</table>';
          gridHTML +=   '</div>';

          gridHTML +=   '<div id="'+BaseID+'div-table-footer" class="ui-jqmGrid-div-table-footer ui-btn-up-b ui-jqmGrid-ll ui-jqmGrid-lr">';
          gridHTML +=   '</div>';

          gridHTML += '</div><div style="clear:both;">';

        Grid.replaceWith(gridHTML);

        Grid=$("#"+gridID); // "Grid" points to the original and, now deleted grid/table DOM jquery object;
                            //         wrap the new one and continue...

        dataColumns.visibleColumnCount = visibleColumnCount;
        Grid.data("dataColumns",dataColumns);
        Grid.data("settings",settings);
        Grid.data("dataRowMetrics",null);
        Grid.data("sortedCol",settings.initialSortedColumn);

        var containerGirdID="#"+BaseID+"table-header";
        Grid.data("headerID",containerGirdID);

        containerGirdID="#"+BaseID+"div-table-wrapper";
        Grid.data("fullID",containerGirdID);


        var FullGrid=$(containerGirdID); // "Grid" always points to the actual <table> that holds the
                                         //    the actual data;  "FullGrid" points to the outermost parent
                                         //    wrapper <div>;  essentially, the whole smash...

        var bodyDiv=FullGrid.find(".ui-jqmGrid-div-table-body");
        bodyDiv.on("scroll.jqmGrid", function(event)
          {
          var scrollElement=$(event.target);
          gridScrolled(scrollElement,
                       event.target.scrollHeight,
                       scrollElement.scrollTop()
                       );
          });



        var colRowCells=FullGrid.find(".hdr-col-cell");
        var BHv="ui-btn-hover-"+settings.headerTheme;
        var BUp="ui-btn-up-"+settings.headerTheme;
        var BDn="ui-btn-down-"+settings.headerTheme;

        // call sort on column cell click
        colRowCells.on("click.jqmGrid",function(){ gridColClick(Grid, dataColumns, $(this).attr("id"));});

        // make the column cells look/work like a button (hover and click)
        colRowCells.hover(function(){$(this).addClass(BHv).removeClass(BUp);},
                          function(){$(this).removeClass(BHv).addClass(BUp);});

        colRowCells.mousedown(function(){$(this).addClass(BDn).removeClass(BUp);});
        colRowCells.mouseup  (function(){$(this).removeClass(BDn).addClass(BUp);});


        // highlight the data rows on hover......
        var BHvD="ui-btn-hover-"+settings.dataRowHoverTheme;
        var BUpD="ui-body-"+settings.dataRowTheme;
        Grid.on({
                "mouseover.jqmGrid":function(){$(this).addClass(BHvD).removeClass(BUpD);},
                "mouseout.jqmGrid": function(){$(this).removeClass(BHvD).addClass(BUpD);}
                },
                "tbody tr");
        });

    },
  dataCell: function(row,colID)
    {
    var cells=$();
    this.each(function()
      {
      var Grid=$(this);
      var dataPump=Grid.data("dataPump");
      var dataColumns=Grid.data("dataColumns");
      var dataColumn=dataColumnOfName(dataColumns,colID);
      if(dataColumn)
        {
        var rowID=dataPump.xlatRowID(row);
        cells = cells.add( Grid.find("#row"+rowID+" #"+dataColumn.name) );
        }
      });

    return cells;
    },
  headerCell: function(colID)
    {
    var cells=$();
    this.each(function()
      {
      var Grid=$(this);
      cells.add( gridHeaderCell(Grid,colID) );
      });

    return cells;
    },
  columnLabel: function(colID,newLabel)
    {
    return this.each(function()
      {
      var Grid=$(this);
      gridHeaderCell(Grid,colID).html(newLabel);
      });
    },
  dataPump: function(dataPump)
    {
    if (arguments.length === 0)
      {
      return this.get(0).data("dataPump");
      }
    else
      {
      if((typeof dataPump==="undefined")||(!(dataPump instanceof Object))) return;

      return this.each(function()
        {
        var Grid=$(this);
        Grid.data("dataPump", dataPump);
        gridResetDataSet(Grid);
        });
      }
    },
  dataSet: function(gridData)
    {
    if (arguments.length === 0)
      {
      return this.get(0).data("dataPump").gridData;
      }
    else
      {
      if((typeof gridData==="undefined")||(!(gridData instanceof Object))) return;

      return this.jqmGrid("dataPump", new LocalDataSetDataPump(gridData) );
      }
    }
  };

  $.fn.jqmGrid =
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

$.fn.jqmGrid.defaultOptions =
  {
  'headerTheme'         : 'b',
  'dataRowTheme'        : 'd',
  'dataRowHoverTheme'   : 'e',
  'dataRowErrorTheme'   : 'e',
  'width'               : -1,
  'height'              : -1,
  'minHeight'           : -1,
  'maxHeight'           : -1,
  'rowsPerPage'         : 20,
  'useCORS'             : false,
  'dataPumpURL'         : '',
  'initialSortedColumn' : null,
  'columnHeaders'       : null,
  'reflowColumns'       : [],
  'columns'             : []
  };


})(jQuery);


///////////////////////////////////

function pullAttr(Grid,attrName,defaultValue)

{
var v=$(Grid).attr(attrName);
//var v=$(Grid).prop(attrName);
if(typeof v==="undefined")
  {
  if(typeof defaultValue!=="undefined")
    v=defaultValue
  else
    v=-1;
  }
return(v);
}

function pullIntAttr(Selector,attrName,defaultValue)

{
var v=Selector.attr(attrName);
if(typeof v==="undefined")
  v=defaultValue;
else if(typeof v==="string")
  v=parseInt(v);
return(v);
}


function extractSettings(Grid,columnRows)

{
var Settings=new Object;

Settings.height     =pullAttr(Grid,"height",-1);
Settings.width      =pullAttr(Grid,"width",-1);
Settings.maxHeight  =pullAttr(Grid,"max-height",-1);
Settings.minHeight  =pullAttr(Grid,"min-height",-1);
Settings.rowsPerPage=pullAttr(Grid,"data-set-rows-per-page",20);
Settings.dataPumpURL=pullAttr(Grid,"data-set-data-pump-url","");
Settings.useCORS    =pullAttr(Grid,"data-set-data-pump-use-CORS","false").toLowerCase()==="true";

if (columnRows.length==0) return(Settings);

Settings.columnHeaders=[];
Settings.reflowColumns=[];
Settings.columns      =[];
Settings.initialSortedColumn=null;

var align;
var claimedHeaderCell = [];
var chc,rhc;
var bottomRowIndex=columnRows.length-1;

columnRows.each(function(rowIndex,tr)
  {
  var columnRow=$(tr).find("th");
  if (rowIndex>=claimedHeaderCell.length)
    {
    claimedHeaderCell[rowIndex] = [];

    }

  Settings.columnHeaders[rowIndex]=[];

//oldWay
columnRow.columnIndex=0;

  columnRow.each(function(thIndex,th)
    {
    var selTH=$(th);

var newWay=true;

    if(newWay)
        {
        columnRow.columnIndex=thIndex;
        while ( (columnRow.columnIndex < claimedHeaderCell[rowIndex].length)
                                  &&
                (claimedHeaderCell[rowIndex][columnRow.columnIndex] ) )
          {
          columnRow.columnIndex++;

          }

        var header=new Object;
        header.startRow=rowIndex;
        header.rowSpan=pullIntAttr(selTH,"rowspan",1);
        header.endRow=header.startRow+(header.rowSpan-1);

        header.startCol=columnRow.columnIndex;
        header.colSpan=pullIntAttr(selTH,"colspan",1);
        header.endCol=header.startCol+(header.colSpan-1);

        for(rhc=header.startRow;rhc<=header.endRow;rhc++)
          {
          if (rhc>=claimedHeaderCell.length)
            { claimedHeaderCell[rhc] = []; }

          for(chc=header.startCol;chc<=header.endCol;chc++)
            claimedHeaderCell[rhc][chc]=true;
          }

        header.name=th.id;
        header.label=th.innerHTML;

        var hidden=selTH.attr("data-hidden");
        if(typeof hidden==="undefined")
          hidden=false
        else if (typeof hidden==="string")
          hidden=(hidden.toLowerCase()==="true");
        header.hidden=hidden;

        var width=selTH.attr("width");
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
        header.width=width;

        align=selTH.attr("header-align");
        if(typeof align==="undefined")
          align=selTH.attr("align");
        if(typeof align!=="undefined")
          header.align=align;

        header.dataColumn=null;

        Settings.columnHeaders[rowIndex][thIndex]=header;

        if(header.endRow==bottomRowIndex)
          {
          var column=new Object;

column.label=th.innerHTML;

          header.dataColumn=column;

          column.name=th.id;
          column.hidden=header.hidden;
          column.width=header.width;
          
          align=selTH.attr("cell-align");
          if(typeof align==="undefined")
            align=selTH.attr("align");
          if(typeof align!=="undefined")
            column.align=header.align;

          var format=selTH.attr("data-format");
          if(typeof format==="string")
            {
            try
              { column.format=eval("("+format+");"); }
            catch(e)
              { column.format=function(){return "err";};}
            }
	  /////////
          var sortDir=selTH.attr("data-sort-direction");
          if(typeof sortDir==="string")
            {
            sortDir=sortDir.toLowerCase();
            if(sortDir=="desc")
              {
              column.ascend=false;
              Settings.initialSortedColumn=column;
              }
            else if(sortDir=="asc")
              {
              column.ascend=true;
              Settings.initialSortedColumn=column;
              }
            }

//          Settings.columns[thIndex]=column;
          Settings.columns[header.startCol]=column;
          }
        }
    else
        {
        var column=new Object;
        var header=new Object;

        header.startRow=rowIndex;
        header.rowSpan=pullIntAttr(selTH,"rowspan",1);
        header.endRow=header.startRow+(header.rowSpan-1);

	/////////

        column.index=thIndex;
        header.index=thIndex;

        /////////

        column.name=th.id;
        header.name=th.id;

        /////////

        column.label=th.innerHTML;
        header.label=th.innerHTML;

        /////////
        var hidden=selTH.attr("data-hidden");
        if(typeof hidden==="undefined")
          hidden=false
        else if (typeof hidden==="string")
          hidden=(hidden.toLowerCase()==="true");
        column.hidden=hidden;
        header.hidden=hidden;

        /////////

        var width=selTH.attr("width");
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
        header.width=width;

	/////////

	var align;

	align=selTH.attr("header-align");
	if(typeof align==="undefined")
	  align=selTH.attr("align");
	if(typeof align!=="undefined")
	  header.align=align;

	align=selTH.attr("cell-align");
	if(typeof align==="undefined")
	  align=selTH.attr("align");
	if(typeof align!=="undefined")
	  column.align=align;

	/////////

	var format=selTH.attr("data-format");
	if(typeof format==="string")
	  {
	  try
	    { column.format=eval("("+format+");"); }
	  catch(e)
	    { column.format=function(){return "err";};}
	  }
	/////////
	var sortDir=selTH.attr("data-sort-direction");
	if(typeof sortDir==="string")
	  {
	  sortDir=sortDir.toLowerCase();
	  if(sortDir=="desc")
	    {
	    column.ascend=false;
	    Settings.initialSortedColumn=column;
	    }
	  else if(sortDir=="asc")
	    {
	    column.ascend=true;
	    Settings.initialSortedColumn=column;
	    }
	  }

	/////////

	header.dataColumn=null;
	header.dataColumn=column;

	Settings.columnHeaders[rowIndex][thIndex]=header;
	Settings.columns[thIndex]=column;

        } //old way


    });
  });

return(Settings);
}

function extractInitialData(newGrid,Grid)

{
var settings=newGrid.data("settings");
var columns=settings.columns;
var dataRows=Grid.find("tbody tr");
var initialData=[];

dataRows.each(function(index,tr)
  {
  var rowData=new Object;
  var dataCells=$(tr).find("td");
  dataCells.each(function(index,td)
    {
    if(index<columns.length)
      {
      var colID=columns[index].name;
      var cellData=new Object;
      cellData.value=$(td).html();
      cellData.style=$(td).attr("style");
      cellData.class=$(td).attr("class");
      rowData[colID] = cellData;
      }
    });

  initialData[index] = rowData;
  });

return(initialData);
}

function enhanceGrids()

{
$("table:jqmData(role='grid')").each(function()
  {
  var Grid=$(this);

//  var columnRow=Grid.find("thead th");
//  if(columnRow.length==0)
//    columnRow=Grid.find("tr:jqmData(role='gridcolumns') th");
//  if(columnRow.length==0)
//    columnRow=Grid.find("tr:jqmData(role='gridcolumns') td");
//  if(columnRow.length==0)
//    columnRow=Grid.find("tr th");

  var columnRows=Grid.find("thead tr");

  if(columnRows.length!=0)
    {
    var Settings=extractSettings(this,columnRows);
    Grid.jqmGrid(Settings);

    newGrid=$("#"+this.id);
    var initialData=extractInitialData(newGrid,Grid);
    if(initialData.length>0)
      {
      var dataPump=new LocalDataSetDataPump(initialData);
      newGrid.jqmGrid("dataPump", dataPump);
      }
    else if(Settings.dataPumpURL!="")
      {
      var dataPump=new AJAXPagedDataSetDataPump(Settings.dataPumpURL,Settings.useCORS);
      newGrid.jqmGrid("dataPump", dataPump);
      }
    }
  });
}

$(document).on("pageinit",function()
{
enhanceGrids();
});
