##  Theme Shift
Modifies the hue, saturation, and lightness of all hex color values in a JSON object of unknown depth, or css file.
In progress.

Current state of this branch:
- processJSON() is working. alters hex values within a json object.
- processCSS() is working for hex values and rgb/a values. 


##### Options:

  --version         Show version number                                [boolean]
  
  --path, -p        provide a path to the file to read       [string] [required]
  
  --output, -o      provide a path for the output file                  [string]
                                              
  --hue, -h         desired shift in hue. example: -110                 [number] 
  
  --saturation, -s  desired shift in saturation. example: 35            [number] 
                                                           
  --lightness, -l   desired shift in lightness. example: -10            [number]
                                                           
  --help            Show this list                                      [boolean]


##### Todo:

- Altering HSL/A Values for css sheets.
- Altering color keywords for css sheets.