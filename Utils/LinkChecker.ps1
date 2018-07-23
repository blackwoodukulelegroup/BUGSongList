#requires -version 4.0

$apiPath = "https://script.google.com/macros/s/AKfycbx-0s1grPv0Wj_wXZUDRggB7Eac_c4TGHkMQ1aNOcNv41eCeg/exec"

# $proxy = "http://proxy.nec.com.au:9090"
# $proxyCreds = Get-Credential

$response = Invoke-WebRequest -Uri $apiPath -UseBasicParsing # -Proxy $proxy -ProxyCredential $proxyCreds

$x = $response.content | ConvertFrom-Json

$linkCount = $x.psobject.Properties | Measure-Object | Select-Object -ExpandProperty Count

write-host ( "Loaded {0} songs" -f $linkCount )

$results = $x.psObject.Properties.GetEnumerator() |
    sort-object |
    ForEach-Object -Begin { $linkIndex = 0 } -Process {
        $linkIndex += 1
        $song = $PSItem
        $songTitle = $song.Value.title
        $songArtist = $song.Value.artist
        $activity = "Checking Song Links"
        Write-Progress -Activity $activity -PercentComplete ( $linkIndex / $linkCount * 100 ) -Status $songTitle
        $song.Value.URL.psobject.Properties.GetEnumerator() |
            foreach-object -process {
                $link = $PSItem
                write-progress -Activity $activity -Status $songTitle -CurrentOperation ( "{0}: {1}" -f $link.name, $link.value ) -PercentComplete ( $linkIndex / $linkCount * 100 )
                if ( $link.Value -match "drive.google.com" ) {
                    $result = Invoke-WebRequest -UseBasicParsing -Uri $link.Value -Method Get
                } else {
                    $result = Invoke-WebRequest -UseBasicParsing -Uri $link.Value -Method Head
                }
                new-object -typename psobject -property @{title=$song.Value.title; url=$link.Value; statuscode = $result.StatusCode; length = $result.Headers.'Content-Length'; ContentType = $result.Headers.'Content-Type' }
            }
    }

$goodResults = @( $results | Where-Object -FilterScript { $_.statuscode -eq 200 } )
$badResults = @( $results | Where-Object -FilterScript { $_.statuscode -ne 200 } )

write-host ( "Found {0} good links and {1} bad" -f $goodResults.Count, $badResults.Count )

$badResults | Select-Object -Property Title, Url, statuscode
