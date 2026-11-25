param(
    [int]$CanvasSize = 800,
    [int]$ContentSize = 680,
    [string[]]$RelativePaths
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$orderSource = Get-Content -Raw -LiteralPath (Join-Path $projectRoot 'order.js')
$imagePaths = if ($RelativePaths) {
    $RelativePaths | Sort-Object -Unique
}
else {
    [regex]::Matches($orderSource, "image:'([^']+)'") |
        ForEach-Object { $_.Groups[1].Value } |
        Sort-Object -Unique
}

foreach ($relativePath in $imagePaths) {
    $sourcePath = Join-Path $projectRoot ($relativePath -replace '/', [IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        throw "No se encontró la imagen: $relativePath"
    }

    $source = [Drawing.Bitmap]::FromFile($sourcePath)
    try {
        $rect = [Drawing.Rectangle]::new(0, 0, $source.Width, $source.Height)
        $data = $source.LockBits($rect, [Drawing.Imaging.ImageLockMode]::ReadOnly, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $stride = [Math]::Abs($data.Stride)
            $pixels = [byte[]]::new($stride * $source.Height)
            [Runtime.InteropServices.Marshal]::Copy($data.Scan0, $pixels, 0, $pixels.Length)

            $minX = $source.Width
            $minY = $source.Height
            $maxX = -1
            $maxY = -1

            for ($y = 0; $y -lt $source.Height; $y++) {
                $row = $y * $stride
                for ($x = 0; $x -lt $source.Width; $x++) {
                    $offset = $row + ($x * 4)
                    $blue = $pixels[$offset]
                    $green = $pixels[$offset + 1]
                    $red = $pixels[$offset + 2]
                    $alpha = $pixels[$offset + 3]
                    $isContent = $alpha -gt 10 -and ($red -lt 248 -or $green -lt 248 -or $blue -lt 248)
                    if ($isContent) {
                        if ($x -lt $minX) { $minX = $x }
                        if ($x -gt $maxX) { $maxX = $x }
                        if ($y -lt $minY) { $minY = $y }
                        if ($y -gt $maxY) { $maxY = $y }
                    }
                }
            }
        }
        finally {
            $source.UnlockBits($data)
        }

        if ($maxX -lt $minX -or $maxY -lt $minY) {
            throw "No se detectó el producto en: $relativePath"
        }

        $detectedWidth = $maxX - $minX + 1
        $detectedHeight = $maxY - $minY + 1
        $padding = [Math]::Max(8, [Math]::Round([Math]::Max($detectedWidth, $detectedHeight) * 0.04))
        $cropX = [Math]::Max(0, $minX - $padding)
        $cropY = [Math]::Max(0, $minY - $padding)
        $cropRight = [Math]::Min($source.Width, $maxX + $padding + 1)
        $cropBottom = [Math]::Min($source.Height, $maxY + $padding + 1)
        $cropWidth = $cropRight - $cropX
        $cropHeight = $cropBottom - $cropY

        $scale = [Math]::Min($ContentSize / $cropWidth, $ContentSize / $cropHeight)
        $drawWidth = [Math]::Max(1, [Math]::Round($cropWidth * $scale))
        $drawHeight = [Math]::Max(1, [Math]::Round($cropHeight * $scale))
        $drawX = [Math]::Round(($CanvasSize - $drawWidth) / 2)
        $drawY = [Math]::Round(($CanvasSize - $drawHeight) / 2)

        $canvas = [Drawing.Bitmap]::new($CanvasSize, $CanvasSize, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $graphics = [Drawing.Graphics]::FromImage($canvas)
            try {
                $graphics.Clear([Drawing.Color]::White)
                $graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceOver
                $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $destination = [Drawing.Rectangle]::new($drawX, $drawY, $drawWidth, $drawHeight)
                $sourceRect = [Drawing.Rectangle]::new($cropX, $cropY, $cropWidth, $cropHeight)
                $graphics.DrawImage($source, $destination, $sourceRect, [Drawing.GraphicsUnit]::Pixel)
            }
            finally {
                $graphics.Dispose()
            }

            $temporaryPath = "$sourcePath.normalized.png"
            $canvas.Save($temporaryPath, [Drawing.Imaging.ImageFormat]::Png)
        }
        finally {
            $canvas.Dispose()
        }
    }
    finally {
        $source.Dispose()
    }

    Move-Item -LiteralPath $temporaryPath -Destination $sourcePath -Force
    Write-Output "Normalizada: $relativePath"
}
