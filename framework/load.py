from sys import argv
script, filename, loadname = argv

locationMark = ['l:in', 'l:at', 'l:on', 'l:from']
timeMark = ['t:in', 't:at', 't:on', 't:from', 't:during', 't:between', 't:before' , 't:after', 't:while', 't:when']

def processTimeLocation(conditionList, Mark, conditionBuffer):
	if conditionList == []:
		return conditionBuffer
	else:
		condition = conditionList.pop(0)
		conditionChar = list(condition)
		conditionWord = condition.split()
		if conditionChar[0:2] == ['L',':']:
			if locationMark.count(conditionWord[0].lower()) == 0:
				prepositionChar = conditionChar[2: len(conditionWord[0])]
				prepositionWord = "".join(prepositionChar)
				conditionBuffer += " in " + " ".join([prepositionWord] + conditionWord[1:])
				return processTimeLocation(conditionList, 'L', conditionBuffer)
			else:
				prepositionChar = conditionChar[2: len(conditionWord[0])]
				prepositionWord = "".join(prepositionChar)
				conditionBuffer += " " + " ".join([prepositionWord] + conditionWord[1:])
				return processTimeLocation(conditionList, 'L', conditionBuffer)
		elif conditionChar[0:2] == ['T',':']:
			if not timeMark.count(conditionWord[0].lower()) == 0:
				processedChar = conditionChar[2: len(conditionWord[0])]
				processedWord = "".join(processedChar)
				conditionBuffer += " " + " ".join([processedWord.lower()] + conditionWord[1:])
				return processTimeLocation(conditionList, 'T', conditionBuffer)
			elif Mark == 'T' and timeMark.count(conditionWord[0].lower()) == 0:
				processedChar = conditionChar[2: len(conditionWord[0])]
				processedWord = "".join(processedChar)
				conditionBuffer += " " + " ".join([processedWord.lower()] + conditionWord[1:])
				return processTimeLocation(conditionList, 'T', conditionBuffer)
			else:
				conditionBuffer += " in " + " ".join(conditionWord)
				return processTimeLocation(conditionList, 'T', conditionBuffer)
		else:
			conditionBuffer += " " + condition
			return processTimeLocation(conditionList, 'None', conditionBuffer)

def processTuple(loadList):
	output = []
	output.append(loadList.pop(0))
	output.append(loadList.pop(0))
	objectBuffer = loadList.pop(0)
	objectChar = list(objectBuffer)
	Mark = 'None'
	if objectChar[0:2] == ['T',':']:
		Mark = 'T'
		temp = objectChar[2:]
		objectBuffer = "".join(temp)
	if objectChar[0:2] == ['L',':']:
		Mark = 'L'
		temp = objectChar[2:]
		objectBuffer = "".join(temp)
	condition = processTimeLocation(loadList, Mark, '')
	output.append(objectBuffer + condition)
	return output

outputFile = (open(filename)).read()
outputLines = outputFile.split('\n')
loadLines = []
sentenceCounter = 0
extractionCandidate = 0
sentenceExtraction = []

for line in outputLines:
	if line == '':
		if extractionCandidate == 1:
			for i in sentenceExtraction:
				loadLines.append(i)
		else:
			sentenceCounter -=1
		extractionCandidate = 0
		sentenceExtraction = []
	else:
		if not line[0].isdigit():
			sentenceCounter += 1
			loadLine = ["-----", ': '.join(["Line Number", str(sentenceCounter)]),"-----"]
			sentenceExtraction.append(loadLine)
		else:
			extractionCandidate = 1
			confidenceRate = float(line[0:3])
			if confidenceRate > 0.2:
				if not line[5] == '(':
					markPoint = line.index('(')
					keyWord = line[5:markPoint]
					startPoint = line.index(':') + 2
					content = '(' + keyWord + ')' + line[startPoint:-1]
				else:
					content = line[6:-1]
				loadLine = content.split('; ')
				if len(loadLine) >= 3:
					loadLine = processTuple(loadLine)
				sentenceExtraction.append(loadLine)

loadFile = open(loadname, 'w')
for i in loadLines:
	loadFile.write(i[0])
	loadFile.write("\n")
	loadFile.write(i[1])
	loadFile.write("\n")
	loadFile.write(i[2])
	loadFile.write("\n")
loadFile.close()
