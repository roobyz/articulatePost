---
title: "Lorem ipsum dolor sit amet"
project: "Lorem One"
image:
  src: "john-schnobrich-2FPjlAyMQTA-unsplash.jpg"
  alt: "Colleages working at a computer"
  citation: "Photo by <a href='https://unsplash.com/@johnschno?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText'>John Schnobrich</a> on <a href='https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText'>Unsplash</a>"
author:
  name: "Roberto Rivera"
  url: "pages/about"
dateCreated: "1/8/2021"
dateModified:
categories: [Programming]
tags: [Python, Javascript]
featured: true
draft: true
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque convallis purus vitae ipsum imperdiet condimentum. Nunc vel vehicula augue. Vestibulum luctus nulla nisl, at congue augue maximus et. Mauris eget massa dui. Cras sagittis accumsan lacus.

Example Quote:

> Dorothy followed her through many of the beautiful rooms in her castle.
>
> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

<!-- ## Table of Content -->

## Install

List:

* This
* That
* and the Other

An **example** JavaScript code.

```js
const srcPath = "./articles/";
const dstPath = "./content/posts/";

fs.watch(srcPath, { persistent: true }, function (event, filename) {
  if ((event = "change")) {
    const srcFile = filename;
    const dstFile = srcFile.split(".")[0] + ".json";

    processor.process(
      toVFile.readSync(srcPath + srcFile, "utf8"),
      function (error, file) {
        if (error) throw error;
        console.error(reporter(error || file));

        let jsonOutput = {
          schema: file.data.frontmatter,
          body: file.contents,
        };

        let article = JSON.stringify(jsonOutput).replace(/\n/g, " ");
        // console.log(article);
        fs.writeFileSync(dstPath + dstFile, article);
      }
    );
  }
});
```

A `Python` code sample.

```python
if __name__ == "__main__":
  import doctest

  doctest.testmod()

  network = Perceptron(
    sample=samples, target=exit, learning_rate=0.01, epoch_number=1000, bias=-1
  )
  network.training()
  print("Finished training perceptron")
  print("Enter values to predict or q to exit")
  while True:
    sample: list = []
    for i in range(len(samples[0])):
      user_input = input("value: ").strip()
      if user_input == "q":
        break
      observation = float(user_input)
      sample.insert(i, observation)
    network.sort(sample)
```

## Math

$$
L = \frac{1}{2} \rho v^2 S C_L
$$

## License

MIT
