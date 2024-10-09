function processData(dataArray) {
    return dataArray.map(item => {
      const [firstName, ...surnameParts] = item.name.split(' ');
      const surname = surnameParts.join(' ');
      return {
        firstName,
        surname,
        id: item.id
      };
    });
  }
  
  function displayTable(data) {
    const container = document.getElementById('tableContainer');
    if (data.length === 0) {
      container.innerHTML = '<p>No data available to display.</p>';
      return;
    }
    let table = container.querySelector('table');
    if (!table) {
      table = document.createElement('table');
      const header = table.insertRow();
      ['First Name', 'Surname', 'ID'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        header.appendChild(th);
      });
      container.appendChild(table);
    }
    table.innerHTML = '';
    const header = table.insertRow();
    ['First Name', 'Surname', 'ID'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      header.appendChild(th);
    });
    data.forEach(item => {
      const row = table.insertRow();
      Object.values(item).forEach(text => {
        const cell = row.insertCell();
        cell.textContent = text;
      });
    });
  }
  
  function updateMethodUsed(method) {
    const methodDiv = document.getElementById('methodUsed');
    methodDiv.textContent = `You have used ${method} to retrieve the data.`;
  }
  
  function fetchSync() {
    try {
      const xhrRef = new XMLHttpRequest();
      xhrRef.open('GET', 'data/reference.json', false);
      xhrRef.send(null);
      if (xhrRef.status !== 200) throw new Error('Failed to fetch reference.json');
      const refData = JSON.parse(xhrRef.responseText);
      const data1Name = refData.data_location;
  
      const xhrData1 = new XMLHttpRequest();
      xhrData1.open('GET', `data/${data1Name}`, false);
      xhrData1.send(null);
      if (xhrData1.status !== 200) throw new Error(`Failed to fetch ${data1Name}`);
      const data1 = JSON.parse(xhrData1.responseText);
      const data2Name = data1.data_location;
      const processedData1 = processData(data1.data);
  
      const xhrData2 = new XMLHttpRequest();
      xhrData2.open('GET', `data/${data2Name}`, false);
      xhrData2.send(null);
      if (xhrData2.status !== 200) throw new Error(`Failed to fetch ${data2Name}`);
      const data2 = JSON.parse(xhrData2.responseText);
      const processedData2 = processData(data2.data);
  
      const xhrData3 = new XMLHttpRequest();
      xhrData3.open('GET', 'data/data3.json', false);
      xhrData3.send(null);
      if (xhrData3.status !== 200) throw new Error('Failed to fetch data3.json');
      const data3 = JSON.parse(xhrData3.responseText);
      const processedData3 = processData(data3.data);
  
      const allData = [...processedData1, ...processedData2, ...processedData3];
      displayTable(allData);
      updateMethodUsed('Synchronous XMLHttpRequest');
    } catch (error) {
      alert(error.message);
    }
  }
  
  function fetchAsync() {
    function getReference(callback) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/reference.json', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          callback(null, JSON.parse(xhr.responseText));
        } else {
          callback(`Failed to fetch reference.json (Status: ${xhr.status})`);
        }
      };
      xhr.onerror = function() {
        callback('Network error while fetching reference.json');
      };
      xhr.send();
    }
  
    function getData(fileName, callback) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `data/${fileName}`, true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          callback(null, JSON.parse(xhr.responseText));
        } else {
          callback(`Failed to fetch ${fileName} (Status: ${xhr.status})`);
        }
      };
      xhr.onerror = function() {
        callback(`Network error while fetching ${fileName}`);
      };
      xhr.send();
    }
  
    getReference(function(err, refData) {
      if (err) return alert(err);
      const data1Name = refData.data_location;
  
      getData(data1Name, function(err, data1) {
        if (err) return alert(err);
        const data2Name = data1.data_location;
        const processedData1 = processData(data1.data);
  
        getData(data2Name, function(err, data2) {
          if (err) return alert(err);
          const processedData2 = processData(data2.data);
  
          getData('data3.json', function(err, data3) {
            if (err) return alert(err);
            const processedData3 = processData(data3.data);
  
            const allData = [...processedData1, ...processedData2, ...processedData3];
            displayTable(allData);
            updateMethodUsed('Asynchronous XMLHttpRequest (Callbacks)');
          });
        });
      });
    });
  }
  
  function fetchWithPromises() {
    function fetchJSON(path) {
      return fetch(path)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${path} (Status: ${response.status})`);
          }
          return response.json();
        });
    }
  
    fetchJSON('data/reference.json')
      .then(refData => {
        return fetchJSON(`data/${refData.data_location}`);
      })
      .then(data1 => {
        const data2Name = data1.data_location;
        const processedData1 = processData(data1.data);
        return Promise.all([Promise.resolve(processedData1), fetchJSON(`data/${data2Name}`)]);
      })
      .then(([processedData1, data2]) => {
        const processedData2 = processData(data2.data);
        return Promise.all([Promise.resolve(processedData1), Promise.resolve(processedData2), fetchJSON('data/data3.json')]);
      })
      .then(([processedData1, processedData2, data3]) => {
        const processedData3 = processData(data3.data);
        const allData = [...processedData1, ...processedData2, ...processedData3];
        displayTable(allData);
        updateMethodUsed('Fetch API (Promises)');
      })
      .catch(error => {
        alert(error.message);
      });
  }
  
  document.getElementById('syncBtn').addEventListener('click', fetchSync);
  document.getElementById('asyncBtn').addEventListener('click', fetchAsync);
  document.getElementById('fetchBtn').addEventListener('click', fetchWithPromises);
  