import React from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import RawTool from "@editorjs/raw";
import Table from "@editorjs/table";
import Marker from "@editorjs/marker";
import CodeTool from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import Embed from "./Embed";

function Editor({ value, onChange }) {
  const editor_block = React.useRef(null);

  React.useEffect(() => {
    new EditorJS({
      holder: editor_block.current,
      tools: {
        header: Header,
        list: List,
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        quote: Quote,
        raw: RawTool,
        table: Table,
        code: CodeTool,
        delimiter: Delimiter,
        inlineCode: InlineCode,
        marker: {
          class: Marker,
        },
        embed: {
          class: Embed,
        },
      },
      placeholder: "Let`s write an awesome story!",
      onChange: (value) =>
        value.saver.save().then((value) => {
          onChange(value);
        }),
      data: value,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={editor_block}
      style={{
        backgroundColor: "white",
        maxHeight: "250px",
        overflow: "scroll",
      }}
    ></div>
  );
}

export default Editor;
