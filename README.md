##  Theme Shift
Modifies the hue, saturation, and lightness of all hex color values in a JSON object of unknown depth, or css file.
In progress.

Current state:
- .css hex value conversion  
- .json traversing and hex value conversion



##### Options:

  --version         Show version number                                [boolean]
  
  --path, -p        provide a path to the file to read       [string] [required]
  
  --output, -o      provide a path for the output file                  [string]
                                              
  --hue, -h         desired shift in hue. example: -110                 [number] 
  
  --saturation, -s  desired shift in saturation. example: 35            [number] 
                                                           
  --lightness, -l   desired shift in lightness. example: -10            [number]
                                                           
  --verbose, -v     lists all original and modified hex values          [boolean]
                                                      
  --help            Show this list                                      [boolean]


##### Todo:

- Modify existing rgb, hsl, and named colors.
- Separate logic into useful functions, with an optional script for file IO.
