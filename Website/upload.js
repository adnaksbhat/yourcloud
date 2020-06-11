document.getElementById("uploadFile").addEventListener('input', onUpload);

showTable();

function clickUpload() {
    document.getElementById("uploadFile").click();
}

function formatBytes(a, b = 2) {
    if (0 === a)
        return "0 Bytes";
    const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024));
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d];
}

function addRow(fname, fsize, fdate, flink) {
    const row = document.createElement('tr');
    var cname = document.createElement('td');
    var csize = document.createElement('td');
    var cdate = document.createElement('td');
    var clink = document.createElement('td');
    cname.innerText = fname;
    csize.innerText = fsize;
    cdate.innerText = fdate;
    const preview = document.createElement('a');
    preview.innerHTML = '<i class="fas fa-cloud-download-alt"></i>';
    preview.href = flink;
    clink.appendChild(preview);
    row.appendChild(cname);
    row.appendChild(csize);
    row.appendChild(cdate);
    row.appendChild(clink);
    document.getElementById("dataTable-body").appendChild(row);

}
async function showTable() {
    const response = await fetch('/table', {
        method: 'GET'
    });
    console.log("request sent");

    const data = await response.json();
    document.getElementById("user").innerText=data.name;
    console.log("table recieved");
    if (data.values.length>0) {
        console.log("user="+data.name);
        console.log("l=" + data.values.length);
        for (var i = 0; i < data.values.length; ++i)
            addRow(data.values[i].name, data.values[i].size, data.values[i].date, data.values[i].link);
    }
    

}
async function onUpload(event) {
    event.preventDefault();
    const file = event.target.files[0];   //selects file from input
    const formData = new FormData();      //set as form data

    var fname = file.name;
    var fsize = formatBytes(file.size);
    var date = new Date();
    var fdate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    formData.append('file', file);
    formData.append('name', fname);
    formData.append('size', fsize);
    formData.append('date', fdate);

    console.log("name=" + fname);
    console.log("size=" + fsize);
    console.log("date=" + fdate);
    console.log(formData);
    console.log("before fetch");

    //send request to server
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    console.log("file sent");

    const data = await response.json();

    console.log("objectrecieved");

    if (data.success) {
        addRow(fname, fsize, fdate, data.flink);
    }

}