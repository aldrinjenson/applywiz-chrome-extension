sizes=(16 32 48 128)

# Loop through each size in the array
for i in "${sizes[@]}"
do
  # Use 'convert' command to resize the image
  convert logo-white.png -resize "${i}x${i}" "${i}x.png"
done
