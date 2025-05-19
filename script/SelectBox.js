function getSelectTemplate( optionsHtml, defaultValue, defaultContent, description ){
  let selectValueHtml = '';
  return `
<span>${description}:</span>
<span class="selected-value" data-value="${defaultValue}">${defaultContent||defaultValue}</span>
<span class="arrow">▼</span>
<div class="options-container">
  ${optionsHtml}
</div>`
}

function getOptionTemplate( value, content ){
  return `<div class="option" data-value="${value}">${content||value}</div>\n`
}

function getImageTemplate( link ){
  return `<img src="./img/${link}" alt="">\n`
}

function generateSelectHtml( valueArray, defaultValueIndex, description ){
  let optionsHtml = '';
  for (let i = 0; i < valueArray.length; i++) {
    const { value, content, imageLink } = valueArray[i];
    if( imageLink ){
      const imageHtml = getImageTemplate( imageLink );
      optionsHtml = optionsHtml+getOptionTemplate( value, imageHtml+content);
    } else {
      optionsHtml = optionsHtml+getOptionTemplate( value, content);
    }
  }

  if( valueArray.length == 0 ){
    valueArray[defaultValueIndex] = { value: 'Empty', content: 'Empty'  }
  }
  if( valueArray[defaultValueIndex] == undefined && defaultValueIndex != -1 ){
    defaultValueIndex = 0;
  } else if( defaultValueIndex == -1 ){
    return getSelectTemplate( optionsHtml, '', '', description );
  } else {
    const { value, content } = valueArray[defaultValueIndex];
    return getSelectTemplate( optionsHtml, value, content, description );
  }
}

function addEvents( selectBoxButton, eventCb, changeSelectValue, valueArray ){
  const selectedValue = selectBoxButton.getElementsByClassName('selected-value')[0]
  const selectOptions = selectBoxButton.getElementsByClassName('options-container')[0].children

  selectBoxButton.addEventListener('click', function(e){
    closeAllSelectBoxes( selectBoxButton );
    selectBoxButton.classList.toggle('open');
  });

  for (let i = 0; i < selectOptions.length; i++) {
    if( valueArray[i].callback ){
      selectOptions[i].addEventListener('click', function(e){
        valueArray[i].callback();
      });
      continue;
    }
    selectOptions[i].addEventListener('click', function(e){
      const trg = selectOptions[i];
      const value = trg.dataset['value'];
      if( changeSelectValue>0 ){ selectedValue.innerText = trg.innerText; }
      if( eventCb ){ eventCb( value ); }
      else { console.error("No event is set up for this SelectBox!!!", event); }
    });
  }
}

function closeAllSelectBoxes( triggerEl ){
  const selectBoxes = document.getElementsByClassName('custom-select-box');
  for (let i = 0; i < selectBoxes.length; i++) {
    const selectBox = selectBoxes[i];
    if( triggerEl == selectBox) continue;
    selectBox.classList.remove('open');
  }
}

const SelectBox = {
  init: function(){
    document.body.addEventListener('click', function(e){
      if( e.target.classList.contains('custom-select-box') ||
        e.target.parentElement.classList.contains('custom-select-box')) {
      } else {
        closeAllSelectBoxes();
      }
    });
  },
  add: function( description, parent, valueArray, defaultValueIndex, eventCb ){
    const idSelector = description+'_selectWrapper';
    const existingElement = $id( idSelector );
    if( existingElement ){ parent.removeChild( existingElement ); }
    const selectHtml = generateSelectHtml( valueArray, defaultValueIndex, description );
    var divWrapper = document.createElement('div');
    divWrapper.innerHTML = selectHtml.trim();
    divWrapper.classList.add('custom-select-box');
    divWrapper.id = idSelector;
    parent.appendChild( divWrapper );
    if( valueArray.length > 0 ){ addEvents( divWrapper, eventCb, defaultValueIndex, valueArray ); }
  }
}

export default SelectBox
