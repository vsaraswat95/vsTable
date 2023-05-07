(function($) {
    $.fn.vsTable2 = function(originalData) {
        function getHeaders() {
            return Object.keys(originalData[0]).map((obj, index) => {
                return {
                    'position': index,
                    'value': obj
                }
            })
        }

        const headers = getHeaders();

        function sortHeaderByPosition() {
            headers.sort((a, b) => a.position - b.position);
        }

        function renderTable() {
            sortHeaderByPosition()
            addTableHeaders()
            addTableBody()
            bindSortingEventsOnHeaders()
            bindDraggingEventsOnHeaders()
        }

        function bindDraggingEventsOnHeaders() {
            let headerColumns = document.querySelectorAll(".vsTable-draggable")
            headerColumns.forEach(head => {
                head.addEventListener("dragstart", startDragging)
                head.addEventListener("dragover", preventDefaultAction)
                head.addEventListener("drop", droppedHeader)
            })
        }

        function startDragging(e) {
            e.dataTransfer.setData('draggedElementPosition', e.target.dataset.position);
        }

        function preventDefaultAction(e) {
            e.preventDefault()
        }

        function droppedHeader(e) {
            e.preventDefault()
            let sourcePosition = e.dataTransfer.getData("draggedElementPosition")
            let targetPosition = e.target.dataset.position
            let sourceIndex = headers.findIndex(function(head) {
                if (head.position == sourcePosition) {
                    return true
                }
            })
            let targetIndex = headers.findIndex(function(head) {
                if (head.position == targetPosition) {
                    return true
                }
            })
            if (sourceIndex !== -1) {
                headers[sourceIndex].position = targetPosition
            }
            if (targetIndex !== -1) {
                headers[targetIndex].position = sourcePosition
            }
            renderTable()
        }

        function bindSortingEventsOnHeaders() {
            let headerColumns = document.querySelectorAll(".vsTable-sortable")
            headerColumns.forEach(head => {
                head.addEventListener("click", sortByHeader)
            })
        }

        function sortByHeader(e) {
            $('.vsTable-sortable').removeClass('vsSorted')
            let sortingKey = e.target.dataset.sortKey
            let sortingDir = e.target.dataset.sortDir === 'asc' ? 'desc' : 'asc'

            customSortData(originalData, sortingKey, sortingDir);
            addTableBody()
            e.target.dataset.sortDir = sortingDir
            $(e.target).addClass('vsSorted')
        }

        function customSortData(singleData, sortingKey, sortingDir) {             
            if (sortingDir === 'desc') {
                singleData.sort((a, b) => (a[sortingKey] < b[sortingKey]) ? 1 : ((b[sortingKey] < a[sortingKey]) ? -1 : 0))
            } else {
                singleData.sort((a, b) => (a[sortingKey] > b[sortingKey]) ? 1 : ((b[sortingKey] > a[sortingKey]) ? -1 : 0))
            }

            singleData.map((item) => {
                if (!item.children || item.children.length === 0) {
                    return
                }

                if (item.children && item.children.length > 0) {
                    customSortData(item.children, sortingKey, sortingDir);
                }
            }) 
 
        }

        function addTableHeaders() {
            let $tableHeader = $('#tableHeader')
            $tableHeader.html('')
            const row = document.createElement("tr")
            headers.map((head) => {
                if (head.value !== 'children' && head.value !== 'isExpanded') {
                    const cell = document.createElement("td")
                    cell.setAttribute("data-position", head.position)
                    if (head.position !== 0) {
                        cell.setAttribute("draggable", 'true')
                        cell.classList.add('vsTable-draggable')
                        cell.classList.add('vsTable-sortable')
                    }
                    cell.setAttribute("data-sort-key", head.value)
                    cell.innerHTML = head.value
                    row.appendChild(cell)
                }
            })
            $tableHeader.append(row)
        }

        function addTableBody() {
            let data = structuredClone(originalData)
            $('#tableBody').html('')
            data.map((singleData, index) => {
                addRow(singleData, index, null, true)
            });
        }

        function addRow (data, index, parent = null, showChild) {
            let parentTarget = parent ?? 'parent_'+index
            let childTarget = 'child_'+index
            let children = data.children;
            delete data.children

            const row = document.createElement("tr")
            row.setAttribute('data-parent', parentTarget)
            row.setAttribute('data-target', childTarget)
            if (showChild) {
                row.classList.add('expandedChild')
            }

            if (data.isExpanded) {
                row.classList.add('expanded')
            }

            headers.map((head) => {
                if (head.value !== 'children' && head.value !== 'isExpanded') {
                    const cell = document.createElement("td")
                    cell.classList.add(head.value.replace(/ /g,"_"))
                    cell.innerHTML = data[head.value]
                    row.appendChild(cell)
                }
            })

            if (children && children.length > 0) {
                row.classList.add('expandable')
            }

            $('#tableBody').append(row)
            if (children && children.length > 0) {
                children.forEach((singleData, i) => {
                    addRow(singleData, index+`_`+i, childTarget, data.isExpanded)
                })
            }
        }

        renderTable();

        $('body').on('click', '.expandable', function () {
            let target = $(this).data('target')
            let originalDataIndexes = target.split('_');
            originalDataIndexes.splice(0, 1)

            let indexStr = [];
            let lastIndex = originalDataIndexes.length - 1
            originalDataIndexes.forEach((k, i) => {
                if (i === lastIndex) {
                    indexStr.push('['+k+']')
                } else {
                    indexStr.push('['+k+'].children')
                }
            })

            let dataToUpdate = Object.byString(originalData, indexStr.join(''))

            $(this).toggleClass('expanded')
            let showing = $(this)[0].classList.contains('expanded')

            dataToUpdate.isExpanded = showing

            $('tr[data-parent = '+target+']').each((i, v) => {
                $(v).toggle();
                if (showing === false) {
                    hideChild(v)
                }
            });
        });

        function hideChild(element) {
            let $target = $(element)
            let targetData = $target.data('target')
            $target.removeClass('expanded')
            $('tr[data-parent = '+targetData+']').each((i, v) => {
                $(v).hide();
                hideChild(v)
            });
        }

        Object.byString = function(o, s) {
            s = s.replace(/\[(\w+)]/g, '.$1'); // convert indexes to properties
            s = s.replace(/^\./, '');           // strip a leading dot
            let a = s.split('.');
            for (let i = 0, n = a.length; i < n; ++i) {
                let k = a[i];
                if (k in o) {
                    o = o[k];
                } else {
                    return;
                }
            }
            return o;
        }

        $('.bodyDiv').scroll(function() {
            let leftPosition = $(this).scrollLeft()
            $('.headDiv').scrollLeft(leftPosition)
        })

    };
}(jQuery));
