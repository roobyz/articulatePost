import fs from "fs";
import { toVFile } from "to-vfile";
import reporter from "vfile-reporter";
import unified from "unified";
import markdown from "remark-parse";
import stringify from "remark-stringify";
import html from "rehype-stringify";
import toc from "remark-toc";
import fm from "remark-frontmatter";
import fmp from "remark-parse-frontmatter";
import math from "remark-math";
import remark2rehype from "remark-rehype";
import katex from "rehype-katex";
import prism from "@mapbox/rehype-prism";
import remark2retext from "remark-retext";
import english from "retext-english";
import indefiniteArticle from "retext-indefinite-article";
import minify from "rehype-preset-minify";
import slug from "rehype-slug";
import crossPostRmd from "./crossPostRmd.mjs";

const mdprocessor = unified()
  .use(markdown)
  .use(toc)
  .use(remark2retext, unified().use(english).use(indefiniteArticle))
  .use(math)
  .use(stringify)
  .use(fm, ["yaml", "toml"])
  .use(fmp)
  .use(remark2rehype)
  .use(slug)
  .use(katex)
  .use(prism)
  .use(html)
  .use(minify);

const date = new Date().toLocaleDateString("en-US");
const srcPath = "../posts/";
const dstPath = "../content/posts/";
const pstSlug = "posts/";

console.log("Watching for change events on Markdown posts...");

fs.watch(srcPath, { persistent: true }, function (event, filename) {
  if ((event = "change")) {
    const srcFile = filename;
    const namFile = srcFile.split(".")[0];
    const dstFile = namFile + ".json";
    const altFile = namFile + ".html";
    const hstFile = namFile + ".hast";

    console.log(altFile);

    mdprocessor.process(
      toVFile.readSync(srcPath + srcFile, "utf8"),
      function (error, file) {
        if (error) throw error;
        console.error(reporter(error || file));

        // Update modified date
        file.data.frontmatter.dateModified = date;

        // Apend the article-body to the frontmatter object
        if (file.contents === "") {
          // Run crossPostRmd
          const text = crossPostRmd(srcPath + altFile, srcPath + hstFile);
          // Assign the cross post body to the articleBody
          file.data.frontmatter["articleBody"] = text;
        } else {
          // Assign the Markdown body to the articleBody
          file.data.frontmatter["articleBody"] = file.contents;
        }

        let pstObj = JSON.stringify(file.data.frontmatter, null, 2);
        let article = pstObj.replace(
          // slugify the article-body headers for toc
          /href=#/gm,
          "href=" + pstSlug + namFile + "#"
          // "href=\\\"javascript: scrollTo('#"
        );

        fs.writeFileSync(dstPath + dstFile, article);
      }
    );
  }
});
