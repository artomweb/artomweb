import os, re
import dateutil.parser as dateP


message = """<!DOCTYPE html>
<html lang="en">

<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous" />
    <link rel="stylesheet" href="styles.css" />

</head>

<body>

<h1 class="text-center title">Projects</h1>

<div class="container">
        <hr class="dashed" />

        <div class="row">
"""

with open('projects/projects.html', "w") as myfile:
    myfile.write(message)

# with open('main.html', "a") as myfileApp:
#     myfileApp.write(message)



mdFiles = os.listdir('projects/md')

i = 0

# print(mdFiles)

unsortedFiles = []

for file in mdFiles:
    with open('projects/md/' + file, 'r') as f:
        date = re.findall('date: (.*$)', f.read(), re.MULTILINE)[0]
        unsortedFiles.append([file, date])

sortedFiles = sorted(unsortedFiles, key=lambda x: dateP.parse(x[1]))

# print(sortedFiles)

for fileDate in sortedFiles:
    file = fileDate[0]
    with open('projects/md/' + file, 'r') as f, open('projects/projects.html', 'a') as htmlFile:

        fileContents = f.read()

        try:
            title = re.findall(r'title: (.*$)', fileContents, re.MULTILINE)[0]
            fileName = file.split('.')[0]
        except IndexError:
            print(f"META NOT SPECIFIED ERROR in {file}")
            exit()

        desc = re.findall(r'desc: (.*$)', fileContents, re.MULTILINE)
        images = re.findall(r'!\[.*?\]\((.*?)\)', fileContents, re.MULTILINE)

        os.system(f"pandoc projects/md/{file} -o projects/html/{fileName}.html -s --css projects/css/pandoc.css")
        print(f"converted {title} to html/{fileName}.html with title {title}")

        if i > 2:
            htmlFile.write("</div>\n<div class=\"row\">")
            i = 0
        
        htmlFile.write(f"<div class=\"col-lg-6 mb-3\">\n<div class=\"card\">\n")

        if images:
            imageAddr = images[0]
            htmlFile.write(f"<img class=\"card-img-top\" src=\"{imageAddr}\" alt=\"Card image cap\">")

        htmlFile.write(f"<div class=\"card-body\">\n<h4 class=\"card-title mb-2\"><i class=\"fab fa-spotify\"></i>{title}</h4>\n")

        if desc:
            htmlFile.write(f"<p class=\"card-text\">{desc[0]}</p>\n")
        
        htmlFile.write(f"<a href=\"html/{fileName}.html\" class=\" stretched-link\"></a>\n<p class=\"card-text\"><small class=\"text-muted\">{fileDate[1]}</small></p></div>\n</div>\n</div>")


with open('projects/projects.html', 'a') as htmlFile:
    htmlFile.write('''</div>

    </body>

    </html>''')

print("exited cleanly")


# print(arr)