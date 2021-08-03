#!/bin/bash


cat > main.html << EOF
<!DOCTYPE html>
<html lang="en">

<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x" crossorigin="anonymous" />
    <link rel="stylesheet" href="styles.css" />

</head>

<body>

<h1 class="text-center title">Blogs</h1>

<div class="container">
        <hr class="dashed" />

        <div class="row">


EOF

j=0

for i in md/*.md; do
    [ -f "$i" ] || break
    file="${i##*/}"
    fl="${file%.*}"
    title=$(grep "^title:" $i | sed 's/^.*: //')
    pandoc $i -o html/$fl.html -s --css ../css/pandoc.css
    echo "converted $i to html/$fl.html with title $title"




    if [ $j -lt 2 ]
    then
        echo -e "<div class=\"col-lg-6 mb-3\">\n<div class=\"card\">\n<div class=\"card-body\">\n<h4 class=\"card-title mb-2\"><i class=\"fab fa-spotify\"></i>$title</h4>\n<a href=\"html/$fl.html\" class=\" stretched-link\">Read....</a>\n</div>\n</div>\n</div>" >> main.html
        ((j++))
    else
        echo -e "</div>\n<div class=\"row\">" >> main.html
        echo -e "<div class=\"col-lg-6 mb-3\">\n<div class=\"card\">\n<div class=\"card-body\">\n<h4 class=\"card-title mb-2\"><i class=\"fab fa-spotify\"></i>$title</h4>\n<a href=\"html/$fl.html\" class=\"stretched-link\">Read....</a>\n</div>\n</div>\n</div>" >> main.html
        j=0

    fi  

done


cat >> main.html << EOF

</div>

</body>

</html>
EOF