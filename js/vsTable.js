(function($) {
    $.fn.vsTable = function(data, options) {
        var settings = $.extend({
            headElement: '#tableHeader',
            bodyElement: '#tableBody',
            headerTableClass: 'table',
            bodyTableClass: 'table',
            maxBodyHeight: '250px',
            drag: false,
            sort: false,
            colWidth: null
        }, options);

        if (typeof data != 'object' || data.length == 0) {
            console.error('Invalid data provied in VSTable')
            return false;
        }

        function getHeaders() {
            return Object.keys(data[0]).map((obj, index) => {
                return {
                    'position': index,
                    'value': obj
                }
            })
        }

        function createRow(obj, type = 'td', customClass = '') {
            const row = document.createElement("tr")
            row.classList.add(customClass)
            headers.map((h) => {
                const cell = document.createElement(type)
                if (settings.colWidth) {
                    cell.setAttribute("width", settings.colWidth + `%`)
                }
                cell.innerHTML = obj[h.value]
                row.appendChild(cell)
            })
            return row
        }

        function sortHeaderByPosition() {
            headers.sort((a, b) => a.position - b.position);
        }

        function renderTable() {
            sortHeaderByPosition()
            settings.colWidth = (100 / headers.length)
            addTableHeaders()
            addTableBody()
            bindDraggingEventsOnHeaders()
            bindSortingEventsOnHeaders()
            $(settings.bodyElement).css({'overflow': 'auto', 'max-height': settings.maxBodyHeight});
        }

        function addTableHeaders() {
            $(settings.headElement).html('')            
            const table = document.createElement('table')
            table.setAttribute('class', settings.headerTableClass)
            const thead = document.createElement('thead')
            const row = document.createElement("tr")
            headers.map((obj) => {
                const cell = document.createElement("th")
                if (settings.drag) {
                    cell.setAttribute("data-position", obj.position)
                    cell.setAttribute("draggable", true)
                    cell.classList.add('vsTable-draggable')
                }
                if (settings.sort) {
                    cell.setAttribute("data-sort-key", obj.value)
                    cell.classList.add('vsTable-sortable')
                }
                if (settings.colWidth) {
                    cell.setAttribute("width", settings.colWidth + `%`)
                }
                cell.innerHTML = obj.value
                row.appendChild(cell)
            });

            thead.appendChild(row)
            table.appendChild(thead)
            $(settings.headElement).append(table)
        }

        function addTableBody() {
            $(settings.bodyElement).html('')
            const table = document.createElement('table')
            table.setAttribute('class', settings.bodyTableClass)
            const tbody = document.createElement('tbody')
            for (var i = 0; i < data.length; i++) {
                tbody.appendChild(createRow(data[i], 'td', 'myTrClass'))
            }
            table.appendChild(tbody)
            $(settings.bodyElement).append(table);
        }

        function bindDraggingEventsOnHeaders() {
            if (!settings.drag) {
                return false
            }
            let headerColumns = document.querySelectorAll(".vsTable-draggable")
            headerColumns.forEach(head => {
                head.addEventListener("dragstart", startDragging)
                head.addEventListener("dragover", preventDefaultAction)
                head.addEventListener("drop", droppedHeader)
            })
        }

        function preventDefaultAction(e) {
            e.preventDefault()
        }

        function startDragging(e) {
            e.dataTransfer.setData('draggedElementPosition', e.target.dataset.position);
        }

        function droppedHeader(e) {
            e.preventDefault()
            let sourcePosition = e.dataTransfer.getData("draggedElementPosition");
            let targetPosition = e.target.dataset.position;

            let sourceIndex = headers.findIndex(function(head, index) {
                if (head.position == sourcePosition) {
                    return true
                }
            })
            let targetIndex = headers.findIndex(function(head, index) {
                if (head.position == targetPosition) {
                    return true
                }
            })

            if (sourceIndex != -1) {
                headers[sourceIndex].position = targetPosition
            }
            if (targetIndex != -1) {
                headers[targetIndex].position = sourcePosition
            }
            renderTable()
        }

        function sortByHeader(e) {
            $('.vsTable-sortable').removeClass('vsSorted')
            let sortingKey = e.target.dataset.sortKey
            let sortingDir = e.target.dataset.sortDir === 'asc' ? 'desc' : 'asc'
            sortData(sortingKey, sortingDir);
            addTableBody()
            e.target.dataset.sortDir = sortingDir
            $(e.target).addClass('vsSorted')
        }

        function sortData(sortingKey, sortingDir) {
            if (sortingDir === 'desc') {
                data.sort((a, b) => (a[sortingKey] < b[sortingKey]) ? 1 : ((b[sortingKey] < a[sortingKey]) ? -1 : 0))
            } else {
                data.sort((a, b) => (a[sortingKey] > b[sortingKey]) ? 1 : ((b[sortingKey] > a[sortingKey]) ? -1 : 0))
            }
        }

        function bindSortingEventsOnHeaders() {
            if (!settings.sort) {
                return false
            }
            let headerColumns = document.querySelectorAll(".vsTable-sortable")
            headerColumns.forEach(head => {
                head.addEventListener("click", sortByHeader)
            })
        }

        const headers = getHeaders();

        renderTable();
    };
}(jQuery));