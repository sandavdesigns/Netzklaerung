import sanitizeHtml from 'sanitize-html';

const mailTags=sanitizeHtml.defaults.allowedTags.concat([
 'center','font','img','table','thead','tbody','tfoot','tr','th','td','colgroup','col','caption','hr'
]);

const styleRules:Record<string,RegExp[]>={
 color:[/^#[0-9a-f]{3,8}$/i,/^rgba?\([\d\s,.%]+\)$/i,/^[a-z]+$/i],
 'background-color':[/^#[0-9a-f]{3,8}$/i,/^rgba?\([\d\s,.%]+\)$/i,/^[a-z]+$/i],
 'font-family':[/^[\w\s,'"-]+$/i],
 'font-size':[/^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/i],
 'font-weight':[/^(?:normal|bold|bolder|lighter|[1-9]00)$/i],
 'font-style':[/^(?:normal|italic|oblique)$/i],
 'text-decoration':[/^[\w\s-]+$/i],
 'text-align':[/^(?:left|right|center|justify|start|end)$/i],
 'line-height':[/^(?:normal|\d+(?:\.\d+)?(?:px|pt|em|rem|%)?)$/i],
 'white-space':[/^(?:normal|nowrap|pre|pre-wrap|pre-line)$/i],
 width:[/^(?:auto|\d+(?:\.\d+)?(?:px|pt|em|rem|%)?)$/i],
 'min-width':[/^(?:auto|\d+(?:\.\d+)?(?:px|pt|em|rem|%)?)$/i],
 'max-width':[/^(?:none|\d+(?:\.\d+)?(?:px|pt|em|rem|%)?)$/i],
 height:[/^(?:auto|\d+(?:\.\d+)?(?:px|pt|em|rem|%)?)$/i],
 margin:[/^(?:0|auto|-?\d+(?:\.\d+)?(?:px|pt|em|rem|%))(?:\s+(?:0|auto|-?\d+(?:\.\d+)?(?:px|pt|em|rem|%))){0,3}$/i],
 'margin-top':[/^(?:0|auto|-?\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i],
 'margin-right':[/^(?:0|auto|-?\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i],
 'margin-bottom':[/^(?:0|auto|-?\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i],
 'margin-left':[/^(?:0|auto|-?\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i],
 padding:[/^(?:0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))(?:\s+(?:0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))){0,3}$/i],
 'padding-top':[/^(?:0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i],
 'padding-right':[/^(?:0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i],
 'padding-bottom':[/^(?:0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i],
 'padding-left':[/^(?:0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i],
 border:[/^(?:none|0|[\d\s.#a-z-]+)$/i],
 'border-top':[/^(?:none|0|[\d\s.#a-z-]+)$/i],
 'border-right':[/^(?:none|0|[\d\s.#a-z-]+)$/i],
 'border-bottom':[/^(?:none|0|[\d\s.#a-z-]+)$/i],
 'border-left':[/^(?:none|0|[\d\s.#a-z-]+)$/i],
 'border-collapse':[/^(?:collapse|separate)$/i],
 'border-spacing':[/^\d+(?:\.\d+)?(?:px|pt|em|rem)(?:\s+\d+(?:\.\d+)?(?:px|pt|em|rem))?$/i],
 'vertical-align':[/^(?:baseline|sub|super|top|text-top|middle|bottom|text-bottom|[-\d.]+(?:px|pt|em|rem|%))$/i],
 display:[/^(?:block|inline|inline-block|table|table-row|table-cell|none)$/i]
};

export function sanitizeMailHtml(html:string){
 return sanitizeHtml(html,{
  allowedTags:mailTags,
  allowedAttributes:{
   '*':['class','id','title','dir','lang','style'],
   a:['href','name','target','rel','title','style','class','id'],
   img:['src','alt','title','width','height','style','class','id'],
   table:['width','height','border','cellpadding','cellspacing','align','bgcolor','role','style','class','id'],
   tr:['align','valign','bgcolor','height','style','class','id'],
   th:['width','height','colspan','rowspan','align','valign','bgcolor','style','class','id'],
   td:['width','height','colspan','rowspan','align','valign','bgcolor','style','class','id'],
   col:['width','span','style'],
   colgroup:['width','span','style'],
   font:['face','size','color','style'],
   hr:['width','size','color','align','style']
  },
  allowedSchemes:['http','https','mailto','tel','cid'],
  allowedSchemesByTag:{img:['http','https','cid']},
  allowedStyles:{'*':styleRules},
  transformTags:{
   a:(_tag,attrs)=>({tagName:'a',attribs:{...attrs,target:'_blank',rel:'noopener noreferrer'}}),
   body:(_tag,attrs)=>({tagName:'div',attribs:attrs})
  }
 });
}

export function mailText(html:string){
 return sanitizeHtml(html,{allowedTags:[],allowedAttributes:{}});
}
