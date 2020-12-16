import React, { useEffect, useState } from 'react';
import './App.css';
import forEach from 'lodash/forEach'
import split from 'lodash/split'
import includes from 'lodash/includes'
import FileSaver from 'file-saver'

import { data } from './data'

const underscoreToCamelcase = (v) => {
  return v.toLowerCase().replace(/_([a-z0-9])/g, function (g) { return g[1].toUpperCase(); });
}

const textbox = (list) => {
  var selectRow = ''
  var name = ''
  var value = ''
  var insertValue = ''
  var updateText = ''
  var dto1 = ''
  var dto2 = ''
  var type = ''
  var model = ''
  forEach(list, (v, index) => {
    const set = underscoreToCamelcase(`set_${v.name}`)
    const get = underscoreToCamelcase(`get_${v.type}`)


    selectRow += `${v.name} AS ${underscoreToCamelcase(v.name)},\n`
    name += `${v.name}`
    value = `${value}model.${underscoreToCamelcase(`get_${v.name}`)}()`
    model = `${model}model.${underscoreToCamelcase(`get_${v.name}`)}()`
    insertValue = `${insertValue}?`
    updateText += `${v.name} = ?,\n`
    dto1 += `dto.${set}(${index + 1}, ${underscoreToCamelcase(v.name)});\n`
    dto2 += `dto.${set}(rs.${get}("${underscoreToCamelcase(v.name)}"));\n`
    type += `private ${v.type} ${underscoreToCamelcase(v.name)};\n`
    if (index + 1 !== list.length) {
      name = `${name}, `
      insertValue = `${insertValue}, `
      value = `${value} +","+ `
      model = `${model}, `
    }
  })

  const line = "\n=================\n\n"
  const result = `${selectRow}${line}${updateText}${line}${`(${name}) VALUES (${value});\n`}${line}${`(${name}) value (${insertValue});\n`}${line}{${model}};\n${line}${dto1}${line}${dto2}${line}${type}`

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

  useEffect(() => {
    const name = async (params) => {
      forEach(data, async (v, i) => {
        const text = v.data
        const valueReplace = text.replace(/\t/g, "").replace(/\n/g, "").replace(/" /g, ";").replace(/ /g, "").replace(/"/g, "")
        const valueSplit = split(valueReplace, ',')

        const mm = valueSplit.map((v) => {
          const tSplit = split(v, ';')
          return { name: tSplit[0], type: getType(tSplit[1]) }
        })

        var selectRow = ''
        var name = ''
        var value = ''
        var insertValue = ''
        var updateText = ''
        var dto1 = ''
        var dto2 = ''
        var type = ''
        var model = ''
        forEach(mm, (v, index) => {
          const set = underscoreToCamelcase(`set_${v.name}`)
          const get = underscoreToCamelcase(`get_${v.type}`)
          selectRow += `${v.name} AS ${underscoreToCamelcase(v.name)},\n`
          name += `${v.name}`
          value = `${value}model.${underscoreToCamelcase(`get_${v.name}`)}()`
          model = `${model}model.${underscoreToCamelcase(`get_${v.name}`)}()`
          insertValue = `${insertValue}?`
          updateText += `${v.name} = ?,\n`
          dto1 += `dto.${set}(${index + 1}, ${underscoreToCamelcase(v.name)});\n`
          dto2 += `dto.${set}(rs.${get}("${underscoreToCamelcase(v.name)}"));\n`
          type += `private ${v.type} ${underscoreToCamelcase(v.name)};\n`
          if (index + 1 !== mm.length) {
            name = `${name}, `
            insertValue = `${insertValue}, `
            value = `${value} +","+ `
            model = `${model}, `
          }
        })

        const line = "\n=================\n\n"
        const result = `${selectRow}${line}${updateText}${line}${`(${name}) VALUES (${value});\n`}${line}${`(${name}) value (${insertValue});\n`}${line}{${model}};\n${line}${dto1}${line}${dto2}${line}${type}`
        console.log(result)

        const file = await makeTextFile(result)
        await FileSaver.saveAs(file, `${v.name}.txt`);
      })
    }
    name()
  }, [])

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
      const tSplit = split(t, ';')
      return { name: tSplit[0], type: getType(tSplit[1]) }
    })
    setList(data)
    setText(value)
  }

  return (
    <div className="container">
      <h2>{data.length}</h2>
      {/* <div className="container-left">
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
      </div> */}
    </div>
  );
}

export default App;
