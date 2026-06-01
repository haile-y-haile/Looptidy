Add-Type -AssemblyName System.Drawing

function Fix-Icon {
  param([string]$Path)

  $img = [System.Drawing.Image]::FromFile($Path)
  $size = [Math]::Min($img.Width, $img.Height)
  $x = [int](($img.Width - $size) / 2)
  $y = [int](($img.Height - $size) / 2)

  $crop = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($crop)
  $srcRect = New-Object System.Drawing.Rectangle $x, $y, $size, $size
  $destRect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $img.Dispose()

  $final = New-Object System.Drawing.Bitmap 1024, 1024
  $g2 = [System.Drawing.Graphics]::FromImage($final)
  $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g2.DrawImage($crop, 0, 0, 1024, 1024)
  $g2.Dispose()
  $crop.Dispose()

  $final.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $final.Dispose()
}

$root = Split-Path -Parent $PSScriptRoot
Fix-Icon (Join-Path $root 'assets/icon.png')
Fix-Icon (Join-Path $root 'assets/splash-icon.png')
Write-Host 'Icons resized to 1024x1024'
