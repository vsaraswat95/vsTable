# vsTable
JQuery table addon

# Uses
```
$.fn.vsTable(Data, {
	headElement: '#tableHeader',
	bodyElement: '#tableBody',
	headerTableClass: 'table table-bordered',
	bodyTableClass: 'table table-bordered',
	maxBodyHeight: '250px',
	drag: true, 
	sort: true,
})
```

## Options

### Data
Data on which table will be created should contain array of objects, Keys will be used as headers of table.
```
var Data = [
{'ID': '1', 'Name': 'Vikas'},
{'ID': '2', 'Name': 'Sharma'}
] 
```

### headElement
Element in the dom in which headers will be displayed. Default value will be #tableHeader, Headers will be rendered in this element of dom.

### bodyElement
Element in the dom in which table body will be displayed. Default value will be #tableBody, Table body will be rendered in this element of dom.

### headerTableClass
Custom class for header table

### bodyTableClass
Custom class for body table

### maxBodyHeight 
Max body height, after that scoll will appear on table body only headers will be fixed

### drag : bool
Move table columns 

### sort : bool
Sort table data based on any column



