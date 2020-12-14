import React, { useState } from 'react';
import './App.css';
import forEach from 'lodash/forEach'
import split from 'lodash/split'
import includes from 'lodash/includes'
import FileSaver from 'file-saver'

const underscoreToCamelcase = (v) => {
  return v.toLowerCase().replace(/_([a-z0-9])/g, function (g) { return g[1].toUpperCase(); });
}

const textbox = (list) => {
  var selectRow = ''
  var name = ''
  var value = ''
  var updateText = ''
  var dto1 = ''
  var dto2 = ''
  var type = ''

  forEach(list, (v, index) => {
    const set = underscoreToCamelcase(`set_${v.name}`)
    const get = underscoreToCamelcase(`get_${v.type}`)


    selectRow += `${v.name} AS ${underscoreToCamelcase(v.name)},\n`
    name += `${v.name}`
    value = `${value}model.${underscoreToCamelcase(`get_${v.name}`)}()`
    updateText += `${v.name} = ?,\n`
    dto1 += `dto.${set}(${index + 1}, ${underscoreToCamelcase(v.name)});\n`
    dto2 += `dto.${set}(rs.${get}("${underscoreToCamelcase(v.name)}"));\n`
    type += `private ${v.type} ${underscoreToCamelcase(v.name)};\n`
    if (index + 1 !== list.length) {
      name = `${name}, `
      value = `${value} +","+ `
    }
  })

  const line = "\n=================\n\n"
  const result = `${selectRow}${line}${updateText}${line}${`(${name}) VALUES (${value});\n`}${line}${dto1}${line}${dto2}${line}${type}`

  return (
    <textarea id="textbox" value={result}>Type something here</textarea>
  )
}

const saveFile = (name) => {
  const fileName = name === '' ? 'undefined' : name
  const textbox = document.getElementById('textbox');
  const file = makeTextFile(textbox.value)
  FileSaver.saveAs(file, `${fileName}.txt`);
}

const makeTextFile = (text) => {
  var textFile = null
  var data = new Blob([text], { type: 'text/plain;charset=utf-8' });
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }
  textFile = window.URL.createObjectURL(data);
  return textFile;
};

function App() {
  const initList = { name: '', type: 'string' }
  const [list, setList] = useState([initList])
  const [fileName, setFileName] = useState('')
  const [text, setText] = useState('')


  const getType = (value) => {
    if (includes(value, 'NUMBER')) return 'BigDecimal'
    if (includes(value, 'DATE')) return 'Date'
    if (includes(value, 'TIMESTAMP')) return 'Date'
    if (includes(value, 'BLOB')) return 'Blob'

    return 'String'
  }

  const handleOnChangeText = (v) => {
    const { value } = v.target
    const valueReplace = value.replace(/, \n\t/g, ",").replace(/,"/g, ";")
    const valueSplit = split(valueReplace, ';')

    const data = valueSplit.map((v) => {
      const t = v.replace(/" /g, ';').replace(/"/g, '')
      console.log(t)

      const tSplit = split(t, ';')
      return { name: tSplit[0], type: getType(tSplit[1]) }
    })
    setList(data)
    setText(value)
  }

  return (
    <div className="container">
      <div className="container-left">
        <br />
        <br />
        <textarea value={text} onChange={handleOnChangeText}></textarea>
      </div>
      <div className="container-right">
        <div className="input-row">
          <span>Table Name</span>
          <input value={fileName} onChange={(v) => setFileName(v.target.value)} />
          <button onClick={() => saveFile(fileName)}>save</button>
        </div>
        {textbox(list)}
      </div>
    </div>
  );
}

export default App;
