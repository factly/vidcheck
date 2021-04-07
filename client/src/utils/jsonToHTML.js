import React from "react";

const parseEditorJsData = (content) => {
  const { blocks } = content || {};

  const html = (
    <>
      {blocks &&
        blocks.map((block, i) => {
          const { data } = block;
          let HeaderTag;
          let style;
          let ListTag;
          let list;
          if (data.level) {
            HeaderTag = `h${data.level}`;
          }

          if (data.style) {
            style = data.style === "unordered" ? "ul" : "ol";
            ListTag = `${style}`;
            list = data.items
              .map((listItem, i) => <li key={i}> {listItem} </li>)
              .reduce((a, c) => [a, "", c]);
          }

          switch (block.type) {
            case "header":
              return (
                <HeaderTag
                  key={i}
                  dangerouslySetInnerHTML={{ __html: data.text }}
                  sx={{ py: 3 }}
                />
              );
            case "paragraph":
              return (
                <p
                  key={i}
                  dangerouslySetInnerHTML={{ __html: data.text }}
                  sx={{ py: 3, wordBreak: "break-word" }}
                />
              );

            case "list":
              return (
                <ListTag
                  sx={{
                    listStylePosition: "inside",
                    listStyleType: "disc",
                    pl: 4,
                  }}
                  key={i}
                >
                  {list}
                </ListTag>
              );

            case "raw":
              return (
                <div
                  key={i}
                  dangerouslySetInnerHTML={{ __html: data.html }}
                  sx={{ py: 3 }}
                />
              );
            case "code":
              return <code sx={{ py: 3 }}>{data.code}</code>;
            default:
              break;
          }
          return null;
        })}
    </>
  );
  return html;
};

export default parseEditorJsData;
