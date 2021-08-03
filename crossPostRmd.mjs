"use strict";

import fs from "fs";
import unified from "unified";
import rehypeParse from "rehype-parse";
import visit from "unist-util-visit";
import html from "rehype-stringify";
import prism from "@mapbox/rehype-prism";
import format from "rehype-format";

export default function crossPostRmd(iFile, hFile) {
  // -------------------------------------------------
  // Strip-out anything not part of the body content
  // -------------------------------------------------
  var text = fs.readFileSync(iFile, "utf8");
  const regStrip = [
    /(.|\n)*<body.*>/,
    /<\/body(.|\n)*/,
    /<head[^]*<\/head>/gi,
    /<style[^]*<\/style>/gi,
    /<script[^]*<\/script>/gi,
    /<h1[^]*<\/h1>/gi,
    "<h2>Abstract</h2>",
    "<h3>Background</h3>",
  ];

  // Loop through and run each regex call
  let i = 0;
  let g = 0;
  while (i < regStrip.length) {
    text = text.replace(regStrip[i], "");
    i++;
  }

  // -------------------------------------------------
  // Process the stripped html fragment
  // -------------------------------------------------
  const content = unified()
    // Treat as a fragment of html
    .data("settings", { fragment: true })
    // Parse HTML to a hast syntax tree
    .use(rehypeParse)
    // Parse the hast nodes to cleanup code highlighting
    .use(() => (tree) => {
      // Recursively walk over nodes and setup for Prims.js
      visit(
        // Node to visit: whole tree
        tree,
        // Filter: only visit div tags that contain an code classes
        (node, index, parent) =>
          node.tagName === "div" &&
          node.properties.className[0] === "sourceCode",
        // Visitor: visit the code content
        (node, index, parent) => {
          // Visit any pre and code elements
          visit(
            node,
            (node) => node.tagName === "pre",
            (node, index, parent) => {
              // Remove existing span highlight elements
              visit(
                node,
                (node) => node.tagName === "span",
                (node, index, parent) => {
                  // Replace the parents (span elements) with their children
                  parent.children.splice(index, 1, ...node.children);
                  // Skip nodes that disappear
                  return [visit.SKIP, index];
                }
              );

              // Identify any code elements
              var codeNode = node.children.find((n) => n.tagName === "code");
              if (!codeNode) return;

              // Redefine the class names for Prism.js
              let newClass = "language-" + codeNode.properties.className[1];

              // Replace the class name for both the pre and code elements
              codeNode.properties.className = [newClass];
              node.properties.className = [""];
              // console.log(node.tagName, index, parent.tagName);
            }
          );

          // Replace the parents (div of sourceCode) with their children
          parent.children.splice(index, 1, ...node.children);
          // Skip nodes that disappear
          return [visit.SKIP, index];
        }
      );
    })
    // Parse the hast nodes to tabify content
    .use(() => (tree) => {
      // Locate nodes with likely tab content
      visit(
        // Node to visit: tabset class
        tree,
        // Filter: only visit level4 div tags (actual tabs)
        (node, index, parent) =>
          node.tagName === "div" &&
          node.properties.className.indexOf("level4") >= 0,
        // Visitor: then visit the elements of teh tab content
        (node, index, parent) => {
          var prntClass = parent.properties;
          if (!prntClass) return;

          // find the text node
          var textNode = node.children.find((n) => n.tagName === "h4");
          if (
            !textNode ||
            !(
              prntClass.className.indexOf("section") >= 0 &&
              prntClass.className.indexOf("tabset") >= 0
            )
          )
            return;

          // Redefine node as an article element of tabcontent class
          node.tagName = "article";
          node.properties.className = ["tabcontent"];

          var tabsetNode = parent.children.find((n) => n.tagName === "nav");
          if (!tabsetNode) {
            i = 0;
            g++;
            // console.log("group:", g, "index:", i);
            parent.children.push({
              type: "element",
              tagName: "nav",
              properties: { className: ["tabs"] },
              children: [],
            });
            var tabsetNode = parent.children.find((n) => n.tagName === "nav");
          }

          if (tabsetNode) {
            i++;

            // Caption (Tab title)
            const caption = textNode.children.find(
              (n) => n.type === "text"
            ).value;
            const cntrlID = node.properties.id;
            const checked = i === 1 ? "checked" : false;

            // <input type="radio" name="tabset" id="tab1" aria-controls="marzen" checked />
            tabsetNode.children.push({
              type: "element",
              tagName: "input",
              properties: {
                type: "radio",
                name: "tabset" + g,
                id: "tab" + g + i,
                className: ["radiomenu"],
                ariaControls: [cntrlID],
                checked: checked,
              },
              children: [
                {
                  type: "text",
                  value: "",
                },
              ],
            });

            // <label for="tab1">Märzen</label>
            tabsetNode.children.push({
              type: "element",
              tagName: "label",
              properties: {
                htmlFor: ["tab" + g + i],
              },
              children: [
                {
                  type: "text",
                  value: caption,
                },
              ],
            });

            // Copy the current node to the new tabset Node
            tabsetNode.children.push(node);
            // Remove the current node
            parent.children.splice(index, 1);
            // Do not traverse `node`, continue at the node *now* at `index`.
            return [visit.SKIP, index];
          }
        }
      );
    })
    .use(() => (tree) => {
      // Locate nodes with likely tab content
      visit(
        // Node to visit: tabset class
        tree,
        // Filter: only visit level4 div tags (actual tabs)
        (node, index, parent) =>
          node.tagName === "table" && parent.tagName !== "pre",
        // Visitor: then visit the elements of teh tab content
        (node, index, parent) => {
          var preNode = parent.children.find((n) => n.tagName === "pre");
          if (!preNode) {
            parent.children.push({
              type: "element",
              tagName: "pre",
              properties: { className: ["table"] },
              children: [],
            });
            var preNode = parent.children.find((n) => n.tagName === "pre");
          }

          // Copy the current node to the new tabset Node
          preNode.children.push(node);
          // Remove the current node
          parent.children.splice(index, 1);
          // Do not traverse `node`, continue at the node *now* at `index`.
          return [visit.SKIP, index];
        }
      );
    })
    // Write the hast tree out to file for testing
    // .use(() => (tree) => {
    //   fs.writeFileSync(hFile, JSON.stringify(tree, null, 2));
    // })
    // Apply syntax highlighting
    .use(prism)
    // Convert the hast back to HTML
    .use(html)
    .use(format)
    // Transform HTML to string
    .processSync(text)
    .toString();

  // fs.writeFileSync(oFile, content);

  return content;
}

// var preNode = node.children.find((n) => n.tagName === "pre");
// if (!preNode && p === 0) {
//   p = 1;
//   node.children.push({
//     type: "element",
//     tagName: "pre",
//     properties: { className: ["table"] },
//     children: [
//       {
//         type: "element",
//         tagName: "table",
//         properties: {},
//         children: [],
//       },
//     ],
//   });
// }
// var preNode = node.children.find((n) => n.tagName === "pre");

// if (preNode) {
//   var tblNode = preNode.children.find((n) => n.tagName === "table");

//   // Copy the current node to the new tabset Node (minus itself)
//   let childArr = node.children;
//   childArr.splice(-1);
//   tblNode.children.push(childArr);

//   // Replace the current node with the new child node
//   node.children.splice(0, node.children.length-2);
//   parent.children.splice(index, 1, ...node.children);
//   // Skip nodes that disappear
//   return [visit.SKIP, index];
//   // console.log(node.children);
//   // console.log(tblNode.children);
//   // console.log(preNode);
// }
