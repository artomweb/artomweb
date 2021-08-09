---
title: Generating Spotify keyrings with Python and Blender
date: 28/04/21
header-includes: <meta name="keywords" content="Foo,Bar" />
  <meta name="description" content="My description" />
---

![ ](/projects/images/keyring/keyring.jpg)

The easiest way to understand Blender's Python commands is to open up the GUI into the Scripting workspace. Here, any modification made to Blender's UI is displayed in the console.

For example when deleting the default cube, this is the output to the console:

![ ](/projects/images/keyring/keyring3.png)

### Clearing the workspace

The first thing you will want to do is delete everything in the default workspace. This makes sure that we are starting from a clean slate with no pesky default cube. Notice that we have to import Blender's python module to be able to interact with Blender.

```python
import bpy
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
bpy.ops.object.select_all(action='DESELECT')
```

### Creating the base

Speaking of cubes, the first thing to do is add a cube for the base. As explained before, to find these commands I will add a cube and scale it to a size that looks good, then copy the log from the console.

```python
bpy.ops.mesh.primitive_cube_add(enter_editmode=False, align='WORLD', location=(0, 0, 0))
bpy.context.object.scale = (0.005, 0.03, 0.001)
```

### Cutting the keyring

To make a hole for the keyring I will add a cylinder and then subtract it from the base with a boolean modifier. When creating the cube I copied the entire command from the terminal, however to simplify the code, most of these arguments are actually defaults.

I can also combine translating and scaling the object into the add function. If in any doubt the console will output the actual arguments that have been parsed when you run the script.

```python
bpy.ops.mesh.primitive_cylinder_add(radius=0.003, depth=0.005, location=(.04, -0.024, 0))
```

This line was actually run like this:

![](/projects/images/keyring/keyring4.jpg)

For the next step it will be useful to keep track of the cube and cylinder. You can't assign objects to variables when you create them, however as they are the only objects in the scene, we can reference them like this:

```python
cube = bpy.data.objects['Cube']
cylinder = bpy.data.objects['Cylinder']
```

Then we can create and apply the boolean modifier:

```python
bool = cube.modifiers.new(type="BOOLEAN", name="bool")
bool.object = cylinder
bool.operation = 'DIFFERENCE'
bpy.context.view_layer.objects.active = cube
bpy.ops.object.modifier_apply(modifier="bool")
```

After the modifier has been applied, the cylinder can be deleted so that we don't accidently export it with the STL:

```python
bpy.ops.object.select_all(action='DESELECT')
cylinder.select_set(True)
bpy.ops.object.delete()
```

### Getting the Spotify code

Spotify doesn't have an API for it's codes however their website, [Spotify Codes](https://www.spotifycodes.com/#) makes a request to this url:

> https://scannables.scdn.co/uri/plain/{format}/{background-color}/{bar-color}/{resolution}/{URI}

For this purpose we want an SVG so it can be used in Blender, therefore our base URL will look like this:

https://scannables.scdn.co/uri/plain/svg/ffffff/black/640/

Then all we need to do is append the song or playlist URI to the end.

Blender can only open an SVG from a file so we must cache it into a file like this:

```python
import requests

URI = input("Enter a song URI")

r = requests.get("https://scannables.scdn.co/uri/plain/svg/ffffff/black/640/" + URI, stream=True)

with open("SpotifyCodeDownload.svg", 'wb') as f:
    for chunk in r.iter_content(1024):
        f.write(chunk)
```

Then we can import it into Blender:

```python
bpy.ops.import_curve.svg(filepath="SpotifyCodeDownload.svg", filter_glob="*.svg")
```

### Processing the SVG

![](/projects/images/keyring/keyring5.png)

EEEK! The SVG is imported as hundreds of individual curves and there is no way around this.

First of all, the curve named 'curve' is a rectangle surrounding the code so we can delete that. Don't forget to deselect everything before you start selecting.

```python
bpy.ops.object.select_all(action='DESELECT')
bpy.data.objects['Curve'].select_set(True)
bpy.ops.object.delete()
```

Next we can combine the rest of the curves into one mesh, this can be done by selecting all the curves in the collection named after the SVG file.

In order to do most operations in Blender you need to have an active object, so after selecting the collection we will make Curve.001 the active object.

```python
for obj in bpy.data.collections['SpotifyCodeDownload.svg'].all_objects:
        obj.select_set(True)


bpy.context.view_layer.objects.active = bpy.data.objects["Curve.001"]

bpy.ops.object.join()

bpy.ops.object.convert(target='MESH')

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
```

The scene currently looks like this:

![](/projects/images/keyring/keyring6.jpg)

So the last thing we need to do is move the SVG in the viewport and copy the output. The first two lines of this extract show an absolute rotation on the z axis.

```python
curve = bpy.data.objects["Curve.001"]

curve.rotation_euler[2] = 1.5708

bpy.ops.transform.resize(value=(0.277968, 0.277968, 0.277968))


bpy.ops.transform.translate(value=(-0.0734364, -0.0216113, 0.0009043))
```

And then extrude it:

```python
bpy.ops.object.mode_set(mode='EDIT')

bpy.ops.mesh.select_all(action='SELECT')

bpy.ops.mesh.extrude_region_move(MESH_OT_extrude_region= TRANSFORM_OT_translate={"value":(0, 0, 0.000875622), "orient_type":'NORMAL'})

bpy.ops.object.mode_set(mode='OBJECT')
```

### Exporting

Finally we can export everything as an stl so it can be 3D printed:

```python
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_mesh.stl(filepath="out.stl", use_selection=True, global_scale=1000)
```

And that's it, the program can be run with this command:

```shell
blender -b --python BlenderStl.py
```

![ ](/projects/images/keyring/keyring2.jpg)

## Full code

You can find all the code here:

<https://github.com/artomweb/Spotify-Code-to-Stl>
