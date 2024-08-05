:loop
START /B /WAIT cmd /c npm run main >> 2.log
@goto loop